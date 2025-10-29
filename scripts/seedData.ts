import Node from "../src/db/models/node";
import User from "../src/db/models/user";
import bcrypt from "bcrypt";
import { Types } from "mongoose";

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
