import { config } from "dotenv";
import validate, { RequiredEnvironmentTypes } from "@boxpositron/vre";

config();

validate([
  {
    name: "SPACES_API_KEY",
    type: RequiredEnvironmentTypes.String,
  },
  {
    name: "SPACES_API_SECRET",
    type: RequiredEnvironmentTypes.String,
  },
  {
    name: "SPACES_ENDPOINT",
    type: RequiredEnvironmentTypes.String,
  },
]);

export const spacesApiKey: string = process.env.SPACES_API_KEY!;
export const spacesApSecret: string = process.env.SPACES_API_SECRET!;
export const spacesEndpoint: string = process.env.SPACES_ENDPOINT!;
