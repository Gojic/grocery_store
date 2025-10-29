import Node from "../src/db/models/node";
import User from "../src/db/models/user";
import bcrypt from "bcrypt";
import { Types } from "mongoose";

/**
 * Ensures that a node (organizational unit) exists in the database.
 * If it does not exist, it will be created.
 *
 * Supports hierarchical structure via `parentId` and `superiors` array,
 * which allows recursive traversal of the organization tree.
 *
 * ### Behavior:
 * - If a node with the same name and parent already exists → returns it.
 * - Otherwise → creates a new node with proper hierarchy references.
 *
 * @async
 * @function ensureNode
 * @param {string} name - Node name (e.g. "Novi Sad", "Radnja 1").
 * @param {"OFFICE" | "STORE"} nodeType - Type of node in the hierarchy.
 * @param {any} [parent] - Optional parent node document (used to set `parentId` and `superiors`).
 *
 * @returns {Promise<Node>} The existing or newly created node document.
 *
 * @example
 * const noviSad = await ensureNode("Novi Sad", "OFFICE", vojvodina);
 * await ensureNode("Radnja 1", "STORE", noviSad);
 */

async function ensureNode(name: string, nodeType: string, parent?: any) {
  const parentId = parent?._id ?? null;
  const superiors = parent ? [...(parent.superiors ?? []), parent._id] : [];

  const node = await Node.findOneAndUpdate(
    { name, parentId },
    { $setOnInsert: { name, nodeType, parentId, superiors } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return node;
}

/**
 * Ensures that a user (manager or employee) exists within a given node.
 * If a user with the given email does not exist, it creates one.
 *
 * Used during seeding to assign demo users to offices and stores.
 *
 * ### Behavior:
 * - If a user with the same email already exists → no action taken.
 * - If not → user is created with the provided properties.
 *
 * @async
 * @function ensureUser
 * @param {string} email - Unique user email.
 * @param {string} name - User’s full name.
 * @param {"MANAGER" | "EMPLOYEE"} role - User’s role within the company.
 * @param {Types.ObjectId} nodeId - The node (office/store) the user belongs to.
 * @param {string} passwordHash - Bcrypt hashed password.
 *
 * @returns {Promise<void>} Resolves when user is ensured in database.
 *
 * @example
 * await ensureUser("m1.novisad@demo.rs", "Menadzer Novi Sad", "MANAGER", noviSad._id, hash);
 */

async function ensureUser(
  email: string,
  name: string,
  role: "MANAGER" | "EMPLOYEE",
  nodeId: Types.ObjectId,
  passwordHash: string
) {
  await User.updateOne(
    { email },
    { $setOnInsert: { email, name, role, passwordHash, nodeId } },
    { upsert: true }
  );
}

/**
 * Seeds the database with a hierarchical demo organization structure
 * and associated users (managers and employees).
 *
 * The structure represents Serbia → Vojvodina → regional offices → stores,
 * with multiple nested levels and a few demo users per node.
 *
 *
 * ### User generation rules:
 * - Each **OFFICE** node → 1 manager, 2 employees.
 * - Each **STORE** node → 0 managers, 3 employees.
 * - Default password: `"Test123!"` (bcrypt-hashed).
 *
 * @async
 * @function seed
 * @returns {Promise<void>} Fills the database with demo nodes and users.
 *
 * @example
 * import { seed } from "./seed";
 * await seed();
 * console.log("Database seeded successfully");
 */

export async function seed() {
  const serbia = await ensureNode("Srbija", "OFFICE");

  /* VOJVODINA */
  const vojvodina = await ensureNode("Vojvodina", "OFFICE", serbia);
  const sevBacka = await ensureNode("Severnobacki okrug", "OFFICE", vojvodina);
  const subotica = await ensureNode("Subotica", "OFFICE", sevBacka);
  await ensureNode("Radnja 1", "STORE", subotica);

  const juzBacka = await ensureNode("Juznobacki okrug", "OFFICE", vojvodina);
  const noviSad = await ensureNode("Novi Sad", "OFFICE", juzBacka);

  const detelinara = await ensureNode("Detelinara", "OFFICE", noviSad);
  await ensureNode("Radnja 2", "STORE", detelinara);
  await ensureNode("Radnja 3", "STORE", detelinara);

  const liman = await ensureNode("Liman", "OFFICE", noviSad);
  await ensureNode("Radnja 4", "STORE", liman);
  await ensureNode("Radnja 5", "STORE", liman);

  /*BEOGRAD*/
  const beograd = await ensureNode("Grad Beograd", "OFFICE", serbia);
  const noviBeograd = await ensureNode("Novi Beograd", "OFFICE", beograd);
  const bezanija = await ensureNode("Bezanija", "OFFICE", noviBeograd);
  await ensureNode("Radnja 6", "STORE", bezanija);

  const vracar = await ensureNode("Vracar", "OFFICE", beograd);
  const neimar = await ensureNode("Neimar", "OFFICE", vracar);
  await ensureNode("Radnja 7", "STORE", neimar);

  const crveniKrst = await ensureNode("Crveni Krst", "OFFICE", vracar);
  await ensureNode("Radnja 8", "STORE", crveniKrst);
  const nodes = await Node.find({});

  let managerCounter = 1;
  let empCounter = 1;
  const pass = await bcrypt.hash("Test123!", 10);

  const perNode = async (
    nodeName: string,
    nodeId: string,
    options?: { managers?: number; employees?: number }
  ) => {
    const { managers = 1, employees = 2 } = options || {};

    for (let i = 0; i < managers; i++) {
      const email = `m${managerCounter++}.${nodeName}@demo.rs`;
      await ensureUser(
        email.toLowerCase(),
        `Menadzer ${nodeName}`,
        "MANAGER",
        new Types.ObjectId(nodeId),
        pass
      );

      for (let i = 0; i < employees; i++) {
        const email = `e${empCounter++}.${nodeName}@demo.rs`;
        await ensureUser(
          email.toLowerCase(),
          `Radnik ${nodeName} ${i + 1}`,
          "EMPLOYEE",
          new Types.ObjectId(nodeId),
          pass
        );
      }
    }
  };

  for (const node of nodes) {
    if (node.nodeType === "OFFICE") {
      await perNode(node.name, node._id.toString(), {
        managers: 1,
        employees: 2,
      });
    } else {
      await perNode(node.name, node._id.toString(), {
        managers: 0,
        employees: 3,
      });
    }
  }
}
