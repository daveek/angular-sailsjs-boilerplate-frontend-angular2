// Angular2 specified stuff
import {Component, Injector, provide} from 'angular2/core';
import {HTTP_PROVIDERS} from 'angular2/http';
import {ComponentInstruction, CanActivate, OnActivate} from 'angular2/router';

// RxJS stuff
import 'rxjs/add/operator/toPromise';

// 3rd party libraries
import {AuthHttp, AuthConfig} from 'angular2-jwt/angular2-jwt';

// Component specified stuff
import {BookService} from './service';

// Component setup
@Component({
  selector: 'book',
  templateUrl: './components/examples/book/book.html'
})

/**
 * Defines route lifecycle hook `CanActivate`, which is called by the router to determine
 * if a component can be instantiated as part of a navigation.
 *
 * This will fetch all necessary books from API _before_ component is activated.
 *
 * @return Promise<boolean>|boolean
 */
@CanActivate((next) => {
  /**
   * Inject all necessary components so that 'BookService' is usable here.
   *
   * @type {Injector}
   */
  let injector = Injector.resolveAndCreate([
    HTTP_PROVIDERS, BookService, AuthHttp,
    provide(AuthConfig, {
      useFactory: () => {
        return new AuthConfig();
      }
    })
  ]);

  // And get BookService
  let bookService = injector.get(BookService);

  return new Promise((resolve, reject) => {
    Promise.all([
      bookService.count().toPromise(),
      bookService.getBooks().toPromise()
    ]).then(
      data => {
        next.params.count = data[0];
        next.params.books = data[1];

        resolve(true);
      },
      error => reject(error)
    );
  });
})

// Actual component class
export class BookCmp implements OnActivate {
  count: number;
  books: any[];

  /**
   * Function to run when router has been activated and first books are fetched from server.
   *
   * @param nextInstruction
   * @param prevInstruction
   */
  routerOnActivate(nextInstruction: ComponentInstruction, prevInstruction: ComponentInstruction) {
    //noinspection TypeScriptUnresolvedVariable
    this.count = nextInstruction.params.count;

    //noinspection TypeScriptUnresolvedVariable
    this.books = nextInstruction.params.books;
  }
}
