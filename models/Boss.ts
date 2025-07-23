import { Document, Schema, models, model, Types } from "mongoose";
import { Worker } from ".";

export interface Boss extends Document {
  name?: string;
  role: string;
  isDirector: boolean;
  isActive: boolean;
  worker: Types.ObjectId | Worker.Worker;
}

const BossSchema = new Schema<Boss>(
  {
    name: {
      type: String,
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    role: {
      type: String,
      required: [true, "Please provide the boss role"],
      maxlength: [60, "Role cannot be more than 60 characters"],
    },
    isDirector: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    worker: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: [true, "Select a worker."],
    },
  },
  {
    collection: "bosses",
    timestamps: true,
  }
);

export default models.Boss || model<Boss>("Boss", BossSchema);
