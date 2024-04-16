import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import { BookModel } from 'src/app/models/book.model';
import { BookService } from 'src/app/services/book.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-book-page',
  templateUrl: './book-page.component.html',
  styleUrls: ['./book-page.component.css'],
})
export class BookPageComponent {
  bookCategoryList: String[] = [
    'Business',
    'History',
    'Science',
    'Religion',
    'Psychology',
    'Sports',
    'Health',
    'Technology',
    'Education',
    'Drama',
  ];
  selectedBookCategoryList: string[] = [];
  bookAutherbyList: string[] = [];
  selectedCreateBookCategoryList: string[] = [];
  bookCreateAutherbyList: string[] = [];
  bookList!: BookModel[];
  bookFormGroup!: FormGroup;
  searchFormGroup!: FormGroup;
  AuthorSearchFormGroup!: FormGroup;
  AuthorCreateSearchFormGroup!: FormGroup;
  errorMessage!: string;
  currentPage: number = 1;
  pageSize: number = 2;
  totalPages: number = 0;
  addBook!: BookModel;
  loaded: boolean = true;
  fileBook!: File;
  constructor(private fb: FormBuilder, private bookService: BookService) {}

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword: this.fb.control(null),
    });
    this.AuthorSearchFormGroup = this.fb.group({
      keyword: this.fb.control(null),
    });
    this.AuthorCreateSearchFormGroup = this.fb.group({
      keyword: this.fb.control(null),
    });
    this.bookFormGroup = this.fb.group({
      id: this.fb.control(UUID.UUID()),
      name: this.fb.control(null, [Validators.required]),
      initial_date: this.fb.control(new Date(), [Validators.required]),
    });
    this.handleGetAllBooks();
  }
  numbers: number[] = [5, 2, 9, 1, 7];

  sortNumbers(): void {
    this.numbers.sort((a, b) => b - a);
    console.log(this.numbers);
  }
  handleFilterBooks(): void {
    const authers = Array.isArray(this.bookAutherbyList)
      ? this.bookAutherbyList.join('')
      : this.bookAutherbyList;
    const categories = Array.isArray(this.selectedBookCategoryList)
      ? this.selectedBookCategoryList.join('')
      : this.selectedBookCategoryList;
    this.loaded = true;
    this.bookService.FilterKeyword(authers + ' ' + categories).subscribe({
      next: (data: BookModel[]) => {
        // this.handleGetAllProducts();
        const modalElement = document.getElementById('filteringBook');
        if (modalElement) {
          // Using Bootstrap's native method to close the modal
          modalElement.classList.remove('show');
          modalElement.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('modal-open');
          const modalBackdrop = document.querySelector('.modal-backdrop');
          if (modalBackdrop) {
            document.body.removeChild(modalBackdrop);
          }
        }
        const sortedData = data
          .filter((book) => typeof book.score === 'number') // Filter out undefined scores
          .sort((a, b) => {
            // Sort in ascending order
            return (b.score || 0) - (a.score || 0);
          });
        this.bookList = sortedData;
        this.loaded = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loaded = false;
        console.log(error.message);
      },
    });
  }
  handleSearchKeyword(): void {
    this.loaded = true;
    this.searchFormGroup.value.keyword !== null
      ? this.bookService
          .searchKeyword(this.searchFormGroup.value.keyword)
          .subscribe({
            next: (data: BookModel[]) => {
              console.log('data:' + data);
              const sortedData = data
                .filter((book) => typeof book.score === 'number') // Filter out undefined scores
                .sort((a, b) => {
                  // Sort in ascending order
                  return (b.score || 0) - (a.score || 0);
                });
              this.bookList = sortedData;
              this.loaded = false;
            },
            error: (error: HttpErrorResponse) => {
              // alert(error.message);
              console.log('error message :' + error.message);
              this.loaded = false;
            },
          })
      : this.handleGetAllBooks();
  }
  handleGetAllBooks(): void {
    this.loaded = true;
    this.bookService.getAllBooks().subscribe({
      next: (data: BookModel[]) => {
        // console.log(data);
        this.bookList = data;
        this.loaded = false;
      },
      error: (error: HttpErrorResponse) => {
        // alert(error.message);
        console.log('error message :' + error.message);
        this.loaded = false;
      },
    });
  }
  // Filter book --------
  onAddAuthorToSearchList() {
    this.AuthorSearchFormGroup.value.keyword !== null
      ? this.bookAutherbyList.push(this.AuthorSearchFormGroup.value.keyword)
      : null;
    this.AuthorSearchFormGroup.reset();
  }
  onRemoveAuthorToSearchList(key: string) {
    this.bookAutherbyList = this.bookAutherbyList.filter(
      (item) => item !== key
    );
  }
  onAddCategoryToSearchList(key: string) {
    if (!this.selectedBookCategoryList.includes(key))
      this.selectedBookCategoryList.push(key);
  }
  onRemoveCategoryToSearchList(key: string) {
    this.selectedBookCategoryList = this.selectedBookCategoryList.filter(
      (item) => item !== key
    );
  }
  // Filter book --------/
  // create book --------
  onAddCreateAuthorToSearchList() {
    this.AuthorCreateSearchFormGroup.value.keyword !== null
      ? this.bookCreateAutherbyList.push(
          this.AuthorCreateSearchFormGroup.value.keyword
        )
      : null;
    this.AuthorCreateSearchFormGroup.reset();
  }
  onRemoveCreateAuthorToSearchList(key: string) {
    this.bookCreateAutherbyList = this.bookCreateAutherbyList.filter(
      (item) => item !== key
    );
  }
  onAddCreateCategoryToSearchList(key: string) {
    if (!this.selectedCreateBookCategoryList.includes(key))
      this.selectedCreateBookCategoryList.push(key);
  }
  onRemoveCreateCategoryToSearchList(key: string) {
    this.selectedCreateBookCategoryList =
      this.selectedCreateBookCategoryList.filter((item) => item !== key);
  }
  // create book --------/
  onFileSelected(event: any) {
    this.fileBook = event.target.files[0];
  }
  handleCreateBook() {
    this.loaded = true;
    this.addBook = this.bookFormGroup.value;
    this.addBook.file = this.fileBook;
    this.addBook.file_type = this.fileBook.type;
    this.addBook.author_by = this.bookCreateAutherbyList;
    this.addBook.category = this.selectedCreateBookCategoryList;
    console.log(this.addBook);

    this.bookService.addbook(this.addBook).subscribe({
      next: (data: any) => {
        this.bookFormGroup.reset();
        // this.handleGetAllProducts();
        const modalElement = document.getElementById('addBook');
        if (modalElement) {
          // Using Bootstrap's native method to close the modal
          modalElement.classList.remove('show');
          modalElement.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('modal-open');
          const modalBackdrop = document.querySelector('.modal-backdrop');
          if (modalBackdrop) {
            document.body.removeChild(modalBackdrop);
          }
        }
        this.loaded = false;
        this.handleGetAllBooks();
        Swal.fire({
          title: 'Success',
          text: 'Book has been added',
          icon: 'success',
        });
        console.log(data);
      },
      error: (error: HttpErrorResponse) => {
        this.loaded = false;
        console.log(error.message);
      },
    });
  }

  handleGoToNextPage(index: number) {
    this.currentPage = index;
    this.handleGetAllBooks();
  }

  handleDeleteBook() {}

  handlOpenEditBox(book: BookModel) {}
}
