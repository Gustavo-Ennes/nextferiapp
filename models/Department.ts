import { Document, Schema, models, model } from "mongoose";

export interface Department extends Document {
  name: string;
  responsible: string;
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
      type: String,
      required: [true, "Please provide the department responsible."],
      maxlength: [60, "Responsible cannot be more than 60 characters"],
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
