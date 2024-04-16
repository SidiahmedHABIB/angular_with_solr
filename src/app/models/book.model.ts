export class BookModel {
  id!: string;
  name!: string;
  score: number | undefined;
  author_by!: string[];
  category!: string[];
  initial_date!: string;
  file!: File;
  file_type!: string;
}
