interface ResponseHeader {
  status: number;
  QTime: number;
  params: {
    q: string;
  };
}

export interface Doc {
  creator: string[];
  id: string;
  author: string[];
  stream_source_info: string[];
  attr_content_attr: string[];
  score: number;
}
interface Response {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: Doc[];
}

export interface SolrFileResponse {
  responseHeader: ResponseHeader;
  response: Response;
}
