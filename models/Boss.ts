import { Document, Schema, models, model } from "mongoose";

export interface Boss extends Document {
  name: string;
  role: string;
  isDirector: boolean;
  isActive: boolean;
}

const BossSchema = new Schema<Boss>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this boss."],
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
      default: false,
    },
  },
  {
    collection: "bosses",
    timestamps: true,
  }
);

export default models.Boss || model<Boss>("Boss", BossSchema);
