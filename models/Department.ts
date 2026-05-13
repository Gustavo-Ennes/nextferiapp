import { Document, Schema, models, model, Types } from "mongoose";
import type { Boss } from "./Boss";

export interface Department extends Document {
  _id: Types.ObjectId;
  name: string;
  responsible?: Types.ObjectId | Boss;
  isActive: boolean;
  hasWorkers?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const DepartmentSchema = new Schema<Department>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this department."],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    responsible: {
      type: Schema.Types.ObjectId,
      ref: "Boss",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hasWorkers: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: "departments",
    timestamps: true,
  },
);

export default models.Department ||
  model<Department>("Department", DepartmentSchema);
