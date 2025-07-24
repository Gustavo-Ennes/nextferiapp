import { Document, Schema, models, model } from "mongoose";
import { Department } from "./Department";

export interface Worker extends Document {
  name: string;
  role: string;
  registry: string;
  matriculation: string;
  admissionDate: Date;
  department: Department | string;
  justification?: string;
  isActive: boolean;
}

export const WorkerSchema = new Schema<Worker>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this worker."],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    role: {
      type: String,
      required: [true, "Please provide the worker role"],
      maxlength: [60, "Role cannot be more than 60 characters"],
    },
    registry: {
      type: String,
      required: [true, "Please provide a registry number for this worker."],
      maxlength: [6, "registry cannot be more than 6 characters"],
      minlength: [6, "registry cannot be less than 6 characters"],
    },
    matriculation: {
      type: String,
      required: [true, "Please provide the worker matriculation."],
      maxlength: [6, "matriculation cannot be more than 6 characters"],
      minlength: [4, "matriculation cannot be less than 4 characters"],
    },
    admissionDate: {
      type: Date,
      required: [true, "Please provide the admission date."],
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Please provide the worker's department."],
    },
    justification: { type: String },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    collection: "workers",
    timestamps: true,
  }
);

export default models.Worker || model<Worker>("Worker", WorkerSchema);
