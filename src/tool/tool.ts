import { Point } from "geom/point";

export default interface Tool {
  onpointerdown(position: Point): void;
  onpointermove(position: Point): void;
  onpointerup(position: Point): void;
}
