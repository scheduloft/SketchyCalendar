import { Point } from "geom/point";
import DrawTool from "./draw";
import CreateCalendarCardTool from "./createcalendarcard";
import CreateCardTool from "./createcard";

export default interface Tool {
  onpointerdown(position: Point): void;
  onpointermove(position: Point): void;
  onpointerup(position: Point): void;
}
