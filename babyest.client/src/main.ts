import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
// import { AppModule } from './app/app.module';

import { provideHttpClient } from '@angular/common/http';
import { enableProdMode, importProvidersFrom, isDevMode } from '@angular/core';
import { AppRoutingModule } from './app/app-routing.module';
import { provideAnimations} from '@angular/platform-browser/animations';



// platformBrowserDynamic().bootstrapModule(AppModule, {
//   ngZoneEventCoalescing: true
// })
//   .catch(err => console.error(err));

//ServiceWorkerModule.register('ngsw-worker.js', {
//  enabled: !isDevMode(),
//  // Register the ServiceWorker as soon as the application is stable
//  // or after 30 seconds (whichever comes first).
//  registrationStrategy: 'registerWhenStable:30000'
//});


 if ('serviceWorker' in navigator && !isDevMode()) {
   navigator.serviceWorker
     .register('/ngsw-worker.js')
     .then((registration) => {
       console.log('Service Worker registered successfully:', registration);
     })
     .catch((error) => {
       console.log('Service Worker registration failed:', error);
     });
 }

//if ('serviceWorker' in navigator) {
//  console.log("service worker in navigator IS ");
//}
//else {
//  console.log("service worker in navigator NO");
//}

//if(isDevMode())
//{
//  console.log("devmode IS");
//}
//else 
//{
//  console.log("devMode NO");
//}

//if(isDevMode)
//{
//  console.log("Function !IS DEVMODE true");
//}
//else {
//  console.log("FUNCTION !IS DEV MODE false");
//}



 //if ('serviceWorker' in navigator && !isDevMode) {
 //  navigator.serviceWorker.register('ngsw-worker.js')
 //    .then((registration) => {
 //      console.log('Service Worker registered with scope:', registration.scope);
 //    })
 //    .catch((error) => {
 //      console.log('Service Worker registration failed:', error);
 //    });
 //}

  bootstrapApplication(AppComponent, 
    {
      providers: [
        importProvidersFrom(AppRoutingModule),
        provideAnimations(),
        provideHttpClient()
      ]
    }
  );
