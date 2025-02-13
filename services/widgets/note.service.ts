import { INote } from "../../model/Widget.ts";
import { NoteData } from "../../types/widgetdata.types.ts";
import { WidgetDataService } from "./widgetdata.service.ts";

export class NoteService implements WidgetDataService<INote, NoteData> {
  fetchData(input: INote): Promise<NoteData> {
    const note: NoteData = {
      note: input.note,
    };
    return Promise.resolve(note);
  }
}
