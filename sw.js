// ============================================================
// NOURGPT — SERVICE WORKER
// BY MUHAMMAD LAMINU
// NOUR OFFICIALS STUDIO
// ============================================================

const CACHE_NAME = "nourgpt-v2.0.0";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

// ============================================================
// INSTALL
// ============================================================

self.addEventListener("install", (event) => {

  console.log(
    "[NOURGPT SW] Installing version 2.0.0..."
  );

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then((cache) => {

        return cache.addAll(APP_FILES);

      })

      .then(() => {

        console.log(
          "[NOURGPT SW] New app files cached."
        );

        return self.skipWaiting();

      })

      .catch((error) => {

        console.error(
          "[NOURGPT SW] Cache installation failed:",
          error
        );

      })

  );

});

// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener("activate", (event) => {

  console.log(
    "[NOURGPT SW] Activating version 2.0.0..."
  );

  event.waitUntil(

    caches.keys()

      .then((cacheNames) => {

        return Promise.all(

          cacheNames

            .filter(
              (cacheName) =>
                cacheName !== CACHE_NAME
            )

            .map((cacheName) => {

              console.log(
                "[NOURGPT SW] Removing old cache:",
                cacheName
              );

              return caches.delete(
                cacheName
              );

            })

        );

      })

      .then(() => {

        return self.clients.claim();

      })

  );

});

// ============================================================
// FETCH
// ============================================================

self.addEventListener(
  "fetch",
  (event) => {

    const request =
      event.request;

    // Only handle GET requests
    if (
      request.method !== "GET"
    ) {
      return;
    }

    /*
     * IMPORTANT:
     * Do NOT cache API requests.
     *
     * Your NOURGPT AI backend must
     * always use the live Render server.
     */

    const requestURL =
      new URL(request.url);

    if (
      requestURL.pathname.startsWith(
        "/api/"
      )
    ) {

      return;

    }

    // --------------------------------------------------------
    // APP FILES
    // Network first → Cache fallback
    // --------------------------------------------------------

    event.respondWith(

      fetch(request)

        .then((networkResponse) => {

          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type !== "opaque"
          ) {

            const responseClone =
              networkResponse.clone();

            caches.open(
              CACHE_NAME
            )
              .then((cache) => {

                cache.put(
                  request,
                  responseClone
                );

              })
              .catch((error) => {

                console.error(
                  "[NOURGPT SW] Cache update failed:",
                  error
                );

              });

          }

          return networkResponse;

        })

        .catch(() => {

          return caches
            .match(request)
            .then((cachedResponse) => {

              if (cachedResponse) {

                return cachedResponse;

              }

              // ------------------------------------------------
              // Navigation fallback
              // ------------------------------------------------

              if (
                request.mode === "navigate"
              ) {

                return caches.match(
                  "./index.html"
                );

              }

              return new Response(
                "NOURGPT is currently offline.",
                {
                  status: 503,

                  statusText:
                    "Service Unavailable",

                  headers: {
                    "Content-Type":
                      "text/plain; charset=utf-8"
                  }

                }
              );

            });

        })

    );

  }
);

// ============================================================
// MESSAGE HANDLER
// ============================================================

self.addEventListener(
  "message",
  (event) => {

    if (!event.data) {
      return;
    }

    // --------------------------------------------------------
    // FORCE NEW SERVICE WORKER
    // --------------------------------------------------------

    if (
      event.data.type ===
      "SKIP_WAITING"
    ) {

      self.skipWaiting();

    }

    // --------------------------------------------------------
    // CLEAR CURRENT CACHE
    // --------------------------------------------------------

    if (
      event.data.type ===
      "CLEAR_CACHE"
    ) {

      event.waitUntil(

        caches.delete(
          CACHE_NAME
        )

      );

    }

  }
);

// ============================================================
// READY
// ============================================================

console.log(
  "[NOURGPT SW] Service Worker v2.0.0 loaded."
);

console.log(
  "[NOURGPT SW] Created by Muhammad Laminu."
);