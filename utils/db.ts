

const DB_NAME = 'CorionMediaDB';
const MEDIA_STORE_NAME = 'mediaFiles';
const METADATA_STORE_NAME = 'mediaMetadata';
const DB_VERSION = 2; // Incremented version to add new object store

let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB error:', request.error);
      reject('IndexedDB error');
    };

    request.onsuccess = (event) => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(MEDIA_STORE_NAME)) {
        dbInstance.createObjectStore(MEDIA_STORE_NAME);
      }
      if (!dbInstance.objectStoreNames.contains(METADATA_STORE_NAME)) {
        dbInstance.createObjectStore(METADATA_STORE_NAME);
      }
    };
  });
};

export const saveMedia = (id: string, file: Blob): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject('DB is not initialized.');
    }
    const transaction = db.transaction(MEDIA_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(MEDIA_STORE_NAME);
    const request = store.put(file, id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Error saving media to DB:', request.error);
      reject(request.error);
    };
  });
};

export const getMedia = (id: string): Promise<Blob | undefined> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject('DB is not initialized.');
    }
    const transaction = db.transaction(MEDIA_STORE_NAME, 'readonly');
    const store = transaction.objectStore(MEDIA_STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result as Blob | undefined);
    };

    request.onerror = () => {
      console.error('Error getting media from DB:', request.error);
      reject(request.error);
    };
  });
};

export const deleteMedia = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject('DB is not initialized.');
    }
    const transaction = db.transaction(MEDIA_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(MEDIA_STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Error deleting media from DB:', request.error);
      reject(request.error);
    };
  });
};


// --- New functions for metadata ---
export const saveMediaMetadata = (items: import('../types').MediaLibraryItem[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject('DB is not initialized.');
        }
        const transaction = db.transaction(METADATA_STORE_NAME, 'readwrite');
        const store = transaction.objectStore(METADATA_STORE_NAME);
        const request = store.put(items, 'mediaLibraryItems');

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = () => {
            console.error('Error saving media metadata to DB:', request.error);
            reject(request.error);
        };
    });
};

export const getMediaMetadata = (): Promise<import('../types').MediaLibraryItem[]> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject('DB is not initialized.');
        }
        const transaction = db.transaction(METADATA_STORE_NAME, 'readonly');
        const store = transaction.objectStore(METADATA_STORE_NAME);
        const request = store.get('mediaLibraryItems');

        request.onsuccess = () => {
            resolve((request.result as import('../types').MediaLibraryItem[]) || []);
        };

        request.onerror = () => {
            console.error('Error getting media metadata from DB:', request.error);
            reject(request.error);
        };
    });
};
