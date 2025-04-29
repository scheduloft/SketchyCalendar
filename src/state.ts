import * as Automerge from "@automerge/automerge/next";
import { DocHandle, Repo } from "@automerge/automerge-repo";
import { Point } from "geom/point";
import { Vec } from "geom/vec";
import Render, { fillAndStroke, fill, stroke, font } from "render";

const DEBUG = true;

export type Id<T> = string & { __brand: T };

export type Stroke = {
  id: Id<Stroke>;
  cardId?: Id<Card>;
  pageId?: Id<Page>;
  points: Array<Point>;
};

function arePointsNear(
  position: Point,
  points: Array<Point>,
  distance: number = 10
): boolean {
  for (const pt of points) {
    const dx = pt.x - position.x;
    const dy = pt.y - position.y;
    if (dx * dx + dy * dy < distance) {
      return true;
    }
  }
  return false;
}

export type Card = {
  id: Id<Card>;
  width: number;
  height: number;
  strokes: Array<Stroke>;
};

export type CardInstance = {
  id: Id<CardInstance>;
  cardId: Id<Card>;
  x: number;
  y: number;
};

export type Page = {
  id: Id<Page>;
  cardInstances: Array<CardInstance>;
  strokes: Array<Stroke>;
};

export type State = {
  cards: Record<Id<Card>, Card>;
  pages: Record<Id<Page>, Page>;
  pageOrder: Array<Id<Page>>;
};

function generateId<T>(): Id<T> {
  return `${Math.random().toString(36).substring(2, 15)}${Math.random()
    .toString(36)
    .substring(2, 15)}` as Id<T>;
}

export function createStateDoc(repo: Repo): DocHandle<State> {
  const firstPageId = generateId<Page>();

  return repo.create({
    cards: {},
    pages: {
      [firstPageId]: {
        id: firstPageId,
        cardInstances: [],
        strokes: [],
      },
    },
    pageOrder: [firstPageId],
  });
}

export default class StateManager {
  currentPage: Id<Page>;
  docHandle: DocHandle<State>;

  constructor(docHandle: DocHandle<State>) {
    this.docHandle = docHandle;
    this.currentPage = this.state.pageOrder[0];
  }

  get state(): State {
    return this.docHandle.docSync() as State;
  }

  update(callback: (state: State) => void) {
    this.docHandle.change(callback);
  }

  createNewCard(position: Point): CardInstance {
    const cardId = generateId<Card>();

    this.update((state) => {
      state.cards[cardId] = {
        id: cardId,
        width: 5,
        height: 5,
        strokes: [],
      };
    });

    return this.createCardInstance(cardId, position);
  }

  createCardInstance(cardId: Id<Card>, position: Point): CardInstance {
    const instanceId = generateId<CardInstance>();
    const instance = {
      id: instanceId,
      cardId,
      x: position.x,
      y: position.y,
    };

    this.update((state) => {
      state.pages[this.currentPage].cardInstances.push(instance);
    });

    return instance;
  }

  updateCardSize(cardId: Id<Card>, width: number, height: number): void {
    this.update((state) => {
      state.cards[cardId].width = width;
      state.cards[cardId].height = height;
    });
  }

  moveCardInstance(instanceId: Id<CardInstance>, position: Point): void {
    this.update((state) => {
      const instance = state.pages[this.currentPage].cardInstances.find(
        (instance) => instance.id === instanceId
      );
      if (!instance) return;
      instance.x = position.x;
      instance.y = position.y;
    });
  }

  erase(position: Point): void {
    const instance = this.findCardInstanceAt(position);
    if (!instance) return;

    this.update((state) => {
      const card = state.cards[instance.cardId];
      card.strokes.forEach((stroke) => {
        let offset_points = stroke.points.map((p) => Vec.add(p, instance));
        if (arePointsNear(position, offset_points)) {
          card.strokes.splice(card.strokes.indexOf(stroke), 1);
        }
      });
    });
  }

  findCardInstanceAt(position: Point): CardInstance | null {
    const currentPage = this.state.pages[this.currentPage];
    return (
      currentPage.cardInstances.find((instance) => {
        const card = this.state.cards[instance.cardId];
        return (
          position.x >= instance.x &&
          position.x <= instance.x + card.width &&
          position.y >= instance.y &&
          position.y <= instance.y + card.height
        );
      }) || null
    );
  }

  createNewStroke(position: Point): { stroke: Stroke; offset: Point } {
    const instance = this.findCardInstanceAt(position);

    if (instance) {
      const stroke = {
        id: generateId<Stroke>(),
        cardId: instance.cardId,
        points: [],
      };

      this.update((state) => {
        const card = state.cards[instance.cardId];
        card.strokes.push(stroke);
      });

      return { stroke, offset: instance };
    } else {
      console.log("createNewStroke on page", instance);

      const stroke = {
        id: generateId<Stroke>(),
        pageId: this.currentPage,
        points: [],
      };

      this.update((state) => {
        const page = state.pages[this.currentPage];
        page.strokes.push(stroke);
      });

      return { stroke, offset: { x: 0, y: 0 } };
    }
  }

  addPointToStroke(stroke: Stroke, point: Point): void {
    this.update((state) => {
      if (stroke.pageId) {
        const mutableStroke = state.pages[stroke.pageId].strokes.find(
          (s) => s.id === stroke.id
        );
        if (!mutableStroke) return;
        mutableStroke.points.push(point);
      } else if (stroke.cardId) {
        const mutableStroke = state.cards[stroke.cardId].strokes.find(
          (s) => s.id === stroke.id
        );
        if (!mutableStroke) return;
        mutableStroke.points.push(point);
      }
    });
  }

  render(render: Render) {
    const currentPage = this.state.pages[this.currentPage];

    currentPage.strokes.forEach((s) => {
      render.poly(s.points, stroke("#000", 1), false);
    });

    currentPage.cardInstances.forEach((instance) => {
      const card = this.state.cards[instance.cardId];

      render.round_rect(
        instance.x + 2,
        instance.y + 2,
        card.width,
        card.height,
        3,
        fill("#0001")
      );
      render.round_rect(
        instance.x,
        instance.y,
        card.width,
        card.height,
        3,
        fillAndStroke("#FFF", "#0002", 0.5)
      );

      card.strokes.forEach((s) => {
        const offset_stroke = s.points.map((p) => Vec.add(p, instance));
        render.poly(offset_stroke, stroke("#000", 1), false);
      });
    });
  }
}
