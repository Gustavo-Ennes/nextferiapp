import mongoose, { Schema, model, models } from "mongoose";
import type { Document } from "mongoose";
import { Boss, Worker } from "./index";

export interface Vacation extends Document {
  duration?: 0.5 | 1 | 15 | 30 | 45 | 60 | 75 | 90;
  daysQtd?: 0.5 | 1 | 15 | 30 | 45 | 60 | 75 | 90;
  type: "normal" | "license" | "dayOff";
  period?: "half" | "full";
  startDate: Date;
  endDate: Date;
  deferred: boolean;
  worker: mongoose.Types.ObjectId | Worker.Worker;
  boss: mongoose.Types.ObjectId | Boss.Boss;
  observation?: string;
  cancelled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VacationSchema = new Schema<Vacation>(
  {
    duration: {
      type: Number,
      enum: {
        values: [0.5, 1, 15, 30, 45, 60, 75, 90],
        message:
          "Invalid duration. Allowed values are: 0.5, 1, 15, 30, 45, 60, 75, 90 days.",
      },
      required: [true, "Duration is required"],
    },
    type: {
      type: String,
      enum: {
        values: ["normal", "license", "dayOff"],
        message: "Invalid type. Allowed types are: normal, license and dayOff.",
      },
      required: [true, "Type is required"],
    },
    period: {
      type: String,
      enum: {
        values: ["half", "full"],
        message: "Invalid period. Allowed periods: half and full.",
      },
      required: [
        function (this: Vacation) {
          return this.type === "dayOff";
        },
        "Period is required when vacation type is 'dayOff'",
      ],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required."],
    },
    endDate: {
      type: Date,
    },
    worker: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: [true, "A worker is required."],
    },
    boss: {
      type: Schema.Types.ObjectId,
      ref: "Boss",
      required: [true, "A boss is required to authorize."],
    },
    observation: {
      type: String,
    },
    cancelled: {
      type: Boolean,
      default: true
      
    }
  },
  {
    timestamps: true,
  }
);

export default models.Vacation || model<Vacation>("Vacation", VacationSchema);
