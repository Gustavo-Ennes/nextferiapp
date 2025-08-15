import { Document, Schema, models, model, Types } from "mongoose";
import { Boss } from ".";

export interface Department extends Document {
  name: string;
  responsible: Types.ObjectId | Boss.Boss;
  isActive: boolean;
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
      required: [true, "Please provide the department responsible."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "departments",
    timestamps: true,
  }
);

export default models.Department ||
  model<Department>("Department", DepartmentSchema);
