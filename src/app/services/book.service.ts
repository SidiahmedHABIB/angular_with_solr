import { Injectable } from '@angular/core';
import { Observable, of, pipe, reduce, switchMap } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Doc, SolrFileResponse } from '../models/solr_file_response.model';
import { BookModel } from '../models/book.model';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private BASEURL: string = 'http://localhost:3000/';
  private SOLRBASEURL: string = 'http://localhost:8983/solr/';
  private collection = 'test_pdf';
  private searchKeywordQueryParms =
    '/select?fl=id%2Cattr_content-attr%2Cauthor%2Ccreator%2Cscore%2Cstream_source_info&indent=true&q.op=OR&q=attr_content-attr:';
  private searchFilterQueryParms =
    '/select?fl=id%2Cattr_content-attr%2Cauthor%2Ccreator%2Cscore%2Cstream_source_info&indent=true&q.op=OR&q=';

  solrDocIds: string[] = [];

  constructor(private httpClient: HttpClient) {}

  public _searchfromSolr(searchKey: string): Observable<SolrFileResponse> {
    const apiUrl =
      this.SOLRBASEURL +
      this.collection +
      this.searchKeywordQueryParms +
      searchKey;
    return this.httpClient.get<SolrFileResponse>(apiUrl);
  }
  public searchKeyword(keyword: string): Observable<BookModel[]> {
    return this._searchfromSolr(keyword).pipe(
      switchMap((data) => {
        // this.solrDocIds = data.response.docs.reduce((previousValue, currentValue) => {
        // }, [])
        return this._getAllBooksByIds(data.response.docs);
      }),
      pipe()
    );
  }
  public _filterfromSolr(searchKey: string): Observable<SolrFileResponse> {
    const apiUrl =
      this.SOLRBASEURL +
      this.collection +
      this.searchFilterQueryParms +
      searchKey;
    return this.httpClient.get<SolrFileResponse>(apiUrl);
  }
  public FilterKeyword(keyword: string): Observable<BookModel[]> {
    return this._filterfromSolr(keyword).pipe(
      switchMap((data) => {
        // this.solrDocIds = data.response.docs.reduce((previousValue, currentValue) => {
        // }, [])
        return this._getAllBooksByIds(data.response.docs);
      }),
      pipe()
    );
  }
  public _getAllBooksByIds(solrResult: Doc[]): Observable<BookModel[]> {
    solrResult.forEach((doc) =>
      !this.solrDocIds.includes(doc.id) ? this.solrDocIds.push(doc.id) : null
    );
    const params = Array.isArray(this.solrDocIds)
      ? this.solrDocIds.join('&id=')
      : this.solrDocIds;

    const url = this.BASEURL + 'books?id=' + params;

    return this.httpClient.get<BookModel[]>(url).pipe(
      switchMap((data: BookModel[]) => {
        // Update score for each BookModel based on matching IDs from solrResult
        data.forEach((book) => {
          const matchingDoc = solrResult.find((doc) => doc.id === book.id);
          if (matchingDoc) {
            book.score = matchingDoc.score;
          }
        });
        // Return the updated BookModel data
        return of(data);
      })
    );
  }
  public getAllBooks(): Observable<BookModel[]> {
    const url = this.BASEURL + 'books';
    return this.httpClient.get<BookModel[]>(url);
  }

  public deleteBookFromSolr(docId: string): Observable<any> {
    const url = `${this.SOLRBASEURL + this.collection}/update?commit=true`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const deleteRequest = {
      delete: {
        query: `id:${docId}`,
      },
    };
    console.log(deleteRequest);
    return this.httpClient.post<any>(url, deleteRequest, { headers });
  }
  public deleteBook(product: BookModel): Observable<any> {
    const url = `${this.BASEURL}products/${product.id}`;
    return this.httpClient.delete(url);
  }
  public addbook(book: BookModel): Observable<BookModel> {
    const url = this.BASEURL + 'books/';
    return this._uploadFileForIndexing(book).pipe(
      switchMap((data: any) => {
        // Once file upload is successful, proceed to post book data
        return this.httpClient.post<BookModel>(url, book);
      })
    );
  }
  _uploadFileForIndexing(book: BookModel): Observable<any> {
    const formData = new FormData();
    formData.append('file', book.file);
    const apiUrl = this.SOLRBASEURL + this.collection + '/update/extract';
    const author = Array.isArray(book.author_by)
      ? book.author_by.join(' ')
      : book.author_by;
    const category = Array.isArray(book.category)
      ? book.category.join(' ')
      : book.category;
    console.log(author);
    console.log(category);
    const params = new HttpParams()
      .set('literal.id', book.id)
      .set('uprefix', 'attr_')
      .set('fmap.content', 'content-attr')
      .set('literal.author', author)
      .set('literal.creator', category);

    return this.httpClient.post<any>(apiUrl, formData, {
      params,
    });
  }
}
