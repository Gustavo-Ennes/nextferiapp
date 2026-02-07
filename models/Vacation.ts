import { Schema, Types, model, models, Document } from "mongoose";
import { addMilliseconds, toDate } from "date-fns";
import type { Worker } from "./Worker";
import type { Boss } from "./Boss";
import type {
  VacationDuration,
  VacationPeriod,
  VacationType,
} from "@/lib/repository/vacation/types";

export interface Vacation extends Document {
  _id: Types.ObjectId;
  duration: VacationDuration;
  type: VacationType;
  period: VacationPeriod;
  startDate: Date;
  endDate: Date;
  returnDate?: Date;
  worker: Worker | Types.ObjectId;
  boss: Boss | Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  observation?: string;
  cancelled?: boolean;
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
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

VacationSchema.virtual("returnDate").get(function () {
  return addMilliseconds(toDate(this.endDate), 1);
});

export default models.Vacation || model<Vacation>("Vacation", VacationSchema);
