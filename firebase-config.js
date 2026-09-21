/*
  =========================================
  Firebase Configuration & Initialization
  Project: Ashis & Ayaka Wedding Website
  Collection: closedones
  =========================================
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// Web app Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwChGK-fpMTtyj72d2JwEWTN3dVUB6OWo",
  authDomain: "weddingplanner-cd3c4.firebaseapp.com",
  projectId: "weddingplanner-cd3c4",
  storageBucket: "weddingplanner-cd3c4.firebasestorage.app",
  messagingSenderId: "221186499672",
  appId: "1:221186499672:web:c63309a05fad7c4286962d",
  measurementId: "G-BZMWWYCYV9"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics (if supported)
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
    console.log("Firebase Analytics initialized successfully.");
  }
}).catch(err => {
  console.warn("Firebase Analytics not supported in current environment:", err);
});

// Initialize Firestore Database
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

/**
 * Uploads an image File object directly to Firebase Storage and returns its HTTPS Download URL
 * @param {File} file - The file selected from PC/phone
 * @param {string} folderPath - Target folder e.g. "avatars" or "keepsakes"
 */
export async function uploadImageToFirebaseStorage(file, folderPath = "photos") {
  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const path = `${folderPath}/${timestamp}_${cleanFileName}`;
    const fileRef = storageRef(storage, path);
    
    console.log(`Uploading file to Firebase Storage: ${path}...`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`Upload successful! Firebase Storage Download URL: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Firebase Storage:", error);
    throw error;
  }
}


/**
 * Saves a closed one record directly to Firebase Firestore collection "closedones"
 * Images are uploaded to Storage and their HTTPS download URLs are saved in the document.
 */
export async function savePersonToFirestore(personData) {
  try {
    let photosArr = [];
    if (Array.isArray(personData.photos) && personData.photos.length > 0) {
      photosArr = personData.photos;
    } else if (personData.togetherImg) {
      photosArr = [personData.togetherImg];
    } else {
      photosArr = ["assets2/Sakura2shot.jpg"];
    }

    const payload = {
      name: personData.name || "Guest",
      role: personData.role || "Friend",
      side: personData.side || "bride", // "bride", "groom", "shared"
      category: personData.category || "friends", // "family", "friends"
      relationship: personData.relationship || "",
      avatarImg: personData.avatarImg || "", // 5 cm Profile Picture HTTPS Storage URL
      photos: photosArr, // Slidable keepsake photos HTTPS Storage URLs
      togetherImg: photosArr[0],
      note: personData.note || "",
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "closedones"), payload);
    console.log("Closed One saved to Firebase Firestore collection 'closedones' with Document ID:", docRef.id);
    return { success: true, id: docRef.id, docId: docRef.id };
  } catch (error) {
    console.error("Error saving person to Firebase Firestore collection 'closedones':", error);
    return { success: false, error };
  }
}

/**
 * Fetches all Closed Ones from Firebase Firestore collection "closedones"
 */
export async function fetchFavoritePeopleFromFirestore() {
  try {
    const q = query(collection(db, "closedones"), orderBy("createdAt", "asc"));
    const querySnapshot = await getDocs(q);
    const people = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      people.push({
        docId: docSnap.id,
        key: docSnap.id,
        ...data,
        photos: Array.isArray(data.photos) && data.photos.length > 0 ? data.photos : [data.togetherImg || 'assets2/Sakura2shot.jpg']
      });
    });
    console.log(`Fetched ${people.length} closed ones from Firebase Firestore collection 'closedones'.`);
    return people;
  } catch (error) {
    console.error("Error fetching closed ones from Firebase Firestore collection 'closedones':", error);
    return null;
  }
}

/**
 * Deletes a closed one document from Firebase Firestore collection "closedones"
 */
export async function deletePersonFromFirestore(docId) {
  try {
    await deleteDoc(doc(db, "closedones", docId));
    console.log("Deleted document from Firestore collection 'closedones':", docId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting document from Firestore collection 'closedones':", error);
    return { success: false, error };
  }
}

/**
 * Seeds default list into Firestore collection "closedones" if empty
 */
export async function seedInitialFirestoreIfNeeded() {
  try {
    const existing = await fetchFavoritePeopleFromFirestore();
    if (existing && existing.length > 0) {
      return existing; // Already populated
    }

    console.log("Seeding default closed ones into Firebase Firestore collection 'closedones'...");
    const defaults = [
      // Ayaka's Family
      { name: "Akiko Watanabe", role: "Mother of the Bride", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/wedding piccs/akochan.png", togetherImg: "assets/wedding piccs/akochan.png", photos: ["assets/wedding piccs/akochan.png"], note: "Ayaka's loving mother, the heart and warmth of the Watanabe family home." },
      { name: "Mr Watanabe", role: "Father of the Bride", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/wedding piccs/kunihisa.png", togetherImg: "assets/wedding piccs/kunihisa.png", photos: ["assets/wedding piccs/kunihisa.png"], note: "Ayaka's supportive and proud father, guiding with boundless love and wisdom." },
      { name: "Ryoma Watanabe", role: "Brother", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/wedding piccs/ryoma.png", togetherImg: "assets/wedding piccs/ryoma.png", photos: ["assets/wedding piccs/ryoma.png"], note: "Ayaka's brother, lifelong companion and trusted confidant." },
      { name: "Tamaki Watanabe", role: "Sister in Law", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/wedding piccs/tamaki.png", togetherImg: "assets/wedding piccs/tamaki.png", photos: ["assets/wedding piccs/tamaki.png"], note: "Brings endless warmth, happiness, and sisterly bond to our family." },
      { name: "Shio Watanabe", role: "Nephew", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/wedding piccs/shio.png", togetherImg: "assets/wedding piccs/shio.png", photos: ["assets/wedding piccs/shio.png"], note: "Beloved nephew bringing endless smiles and playful energy to every family reunion." },
      { name: "Sou Watanabe", role: "Nephew", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/wedding piccs/so.png", togetherImg: "assets/wedding piccs/so.png", photos: ["assets/wedding piccs/so.png"], note: "Beloved nephew whose bright laughter and sweetness light up our home." },
      { name: "Mimi", role: "Family Cat", side: "bride", category: "family", relationship: "Ayaka's Family • Pet", avatarImg: "assets/wedding piccs/mimi.png", togetherImg: "assets/wedding piccs/mimi.png", photos: ["assets/wedding piccs/mimi.png"], note: "The adorable feline queen of the household, master of cozy naps." },
      { name: "Lala", role: "Family Cat", side: "bride", category: "family", relationship: "Ayaka's Family • Pet", avatarImg: "assets/wedding piccs/Lala.png", togetherImg: "assets/wedding piccs/Lala.png", photos: ["assets/wedding piccs/Lala.png"], note: "Sweet and curious family cat who brings purrs and warmth everywhere." },
      { name: "Merun", role: "Family Dog", side: "bride", category: "family", relationship: "Ayaka's Family • Pet", avatarImg: "assets/wedding piccs/merun(right).png", togetherImg: "assets/wedding piccs/merun(right).png", photos: ["assets/wedding piccs/merun(right).png"], note: "Loyal and energetic family pup, always ready for tail-wagging adventures." },
      { name: "Perun", role: "Family Dog", side: "bride", category: "family", relationship: "Ayaka's Family • Pet", avatarImg: "assets/wedding piccs/peron(left).png", togetherImg: "assets/wedding piccs/peron(left).png", photos: ["assets/wedding piccs/peron(left).png"], note: "Playful and cuddly furry companion bringing pure joy to our days." },

      // Ayaka's Friends
      { name: "Makisi Ayaka", role: "Close Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/wedding piccs/makishimom.png", togetherImg: "assets/wedding piccs/makishimom.png", photos: ["assets/wedding piccs/makishimom.png"], note: "Cherished friend who brings wonderful memories, laughter, and support." },
      { name: "RIKO", role: "Close Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/wedding piccs/riko.png", togetherImg: "assets/wedding piccs/riko.png", photos: ["assets/wedding piccs/riko.png"], note: "Dear friend who has shared so many unforgettable moments and milestones." },
      { name: "Sakiho", role: "Close Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/wedding piccs/sakiho(left).png", togetherImg: "assets/wedding piccs/sakiho(left).png", photos: ["assets/wedding piccs/sakiho(left).png"], note: "Always bringing smiles, deep conversations, and uplifting positive energy." },
      { name: "Chiaki", role: "Close Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/wedding piccs/chiaki(right).png", togetherImg: "assets/wedding piccs/chiaki(right).png", photos: ["assets/wedding piccs/chiaki(right).png"], note: "Trusted friend and confidante for life talks and fun celebrations." },
      { name: "Andrea", role: "Close Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/wedding piccs/andrea.png", togetherImg: "assets/wedding piccs/andrea.png", photos: ["assets/wedding piccs/andrea.png"], note: "Wonderful friend sharing unforgettable adventures and warm companionship." },

      // Ashis's Family
      { name: "Mina Kharel", role: "Mother of the Groom", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/wedding piccs/parents.jpg", togetherImg: "assets/wedding piccs/parents.jpg", photos: ["assets/wedding piccs/parents.jpg"], note: "Ashis's loving mother, a pillar of care, warmth, and unconditional devotion." },
      { name: "Prajapati Kharel", role: "Father of the Groom", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/wedding piccs/prajapatikharel.png.jpg", togetherImg: "assets/wedding piccs/prajapatikharel.png.jpg", photos: ["assets/wedding piccs/prajapatikharel.png.jpg"], note: "Ashis's guiding father, inspiring with wisdom, strength, and integrity." },
      { name: "Ayush Kharel", role: "Brother", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/wedding piccs/ayush.png.jpg", togetherImg: "assets/wedding piccs/ayush.png.jpg", photos: ["assets/wedding piccs/ayush.png.jpg"], note: "Inseparable brother and best friend through every chapter of life." },
      { name: "Grandparents", role: "Beloved Grandparents", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/wedding piccs/grandparents.jpg", togetherImg: "assets/wedding piccs/grandparents.jpg", photos: ["assets/wedding piccs/grandparents.jpg"], note: "Our cherished elders whose blessings and love guide our journey." },
      { name: "Shiva Kharel", role: "Uncle", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/wedding piccs/shivakharel.jpg", togetherImg: "assets/wedding piccs/shivakharel.jpg", photos: ["assets/wedding piccs/shivakharel.jpg"], note: "Respected uncle bringing wisdom, support, and family pride." },
      { name: "Kalpana Kharel", role: "Aunt", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/wedding piccs/shivakharel.jpg", togetherImg: "assets/wedding piccs/shivakharel.jpg", photos: ["assets/wedding piccs/shivakharel.jpg"], note: "Loving aunt whose warmth and care brighten every family gathering." },
      { name: "Prabesh Kharel", role: "Cousin", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/wedding piccs/prabesh.cover.png.jpg", togetherImg: "assets/wedding piccs/prabesh.cover.png.jpg", photos: ["assets/wedding piccs/prabesh.cover.png.jpg"], hiddenImg: "assets/wedding piccs/prabesh.hidden.jpg", note: "Cousin and close buddy sharing laughter, brotherhood, and memories." },
      { name: "Prasansha Kharel", role: "Cousin", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/wedding piccs/Prasansha.png.jpg", togetherImg: "assets/wedding piccs/Prasansha.png.jpg", photos: ["assets/wedding piccs/Prasansha.png.jpg"], note: "Wonderful cousin who brings joy, smiles, and sweetness to the family circle." },

      // Ashis's Friends
      { name: "Ryo", role: "Close Friend", side: "groom", category: "friends", relationship: "Groom's Friend", avatarImg: "assets/wedding piccs/Ryo.cover.jpg", togetherImg: "assets/wedding piccs/Ryo.cover.jpg", photos: ["assets/wedding piccs/Ryo.cover.jpg"], note: "Great buddy for travel adventures, gatherings, and unforgettable times." },
      { name: "ChaCha", role: "Close Friend", side: "groom", category: "friends", relationship: "Groom's Friend", avatarImg: "assets/wedding piccs/puktiramsapkotacover.jpeg", togetherImg: "assets/wedding piccs/puktiramsapkotacover.jpeg", photos: ["assets/wedding piccs/puktiramsapkotacover.jpeg"], note: "Valued friend always bringing great energy and memorable moments." },
      { name: "Mama", role: "Close Friend", side: "groom", category: "friends", relationship: "Groom's Friend", avatarImg: "assets/wedding piccs/puktiramsapkotacover.jpeg", togetherImg: "assets/wedding piccs/puktiramsapkotacover.jpeg", photos: ["assets/wedding piccs/puktiramsapkotacover.jpeg"], note: "Cherished friend and constant source of support and good laughs." },
      { name: "Sandesh", role: "Childhood Friend", side: "groom", category: "friends", relationship: "Groom's Friend", avatarImg: "assets/wedding piccs/sandesh.png", togetherImg: "assets/wedding piccs/sandesh.png", photos: ["assets/wedding piccs/sandesh.png"], hiddenImg: "assets/wedding piccs/subhahidden.png", note: "Childhood friend through the years, sharing roots and lifelong brotherhood." },
      { name: "Aditya", role: "Childhood Friend", side: "groom", category: "friends", relationship: "Groom's Friend", avatarImg: "assets/wedding piccs/Screenshot_20210129-134711_Facebook.jpg", togetherImg: "assets/wedding piccs/Screenshot_20210129-134711_Facebook.jpg", photos: ["assets/wedding piccs/Screenshot_20210129-134711_Facebook.jpg"], note: "Childhood friend who grew up together through all life's adventures." },

      // Mutual / Shared Friends
      { name: "Ishwor", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/wedding piccs/ish.png", togetherImg: "assets/wedding piccs/ish.png", photos: ["assets/wedding piccs/ish.png"], note: "Trusted mutual friend who brings great camaraderie and joy to both of us." },
      { name: "Nabin", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/wedding piccs/nabin.png.jpg", togetherImg: "assets/wedding piccs/nabin.png.jpg", photos: ["assets/wedding piccs/nabin.png.jpg"], note: "Always bringing laughter, high energy, and genuine warmth to every meetup." },
      { name: "Sandip", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/wedding piccs/20190530_132857.jpg", togetherImg: "assets/wedding piccs/20190530_132857.jpg", photos: ["assets/wedding piccs/20190530_132857.jpg"], note: "Great friend and adventure buddy through mountain trails and celebrations." },
      { name: "Kristian", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/wedding piccs/kristian.png", togetherImg: "assets/wedding piccs/kristian.png", photos: ["assets/wedding piccs/kristian.png"], note: "Wonderful friend sharing great conversations and memorable gatherings." },
      { name: "Rumon", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/wedding piccs/20180725_183918.jpg", togetherImg: "assets/wedding piccs/20180725_183918.jpg", photos: ["assets/wedding piccs/20180725_183918.jpg"], note: "Reliable friend and the life of every reunion and get-together." },
      { name: "Iman", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/wedding piccs/iman.png", togetherImg: "assets/wedding piccs/iman.png", photos: ["assets/wedding piccs/iman.png"], note: "Cherished mutual friend whose presence makes every occasion special." },
      { name: "Iman's friend", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/wedding piccs/elvina.png", togetherImg: "assets/wedding piccs/elvina.png", photos: ["assets/wedding piccs/elvina.png"], note: "Warm friend welcomed with open arms into our celebration." }
    ];

    for (const item of defaults) {
      await savePersonToFirestore(item);
    }

    return await fetchFavoritePeopleFromFirestore();
  } catch (err) {
    console.error("Error seeding initial closedones collection:", err);
    return null;
  }
}

// Expose on window object
window.firebaseApp = app;
window.firebaseAnalytics = analytics;
window.firebaseDb = db;
window.firebaseStorage = storage;

window.uploadImageToFirebaseStorage = uploadImageToFirebaseStorage;

window.savePersonToFirestore = savePersonToFirestore;
window.fetchFavoritePeopleFromFirestore = fetchFavoritePeopleFromFirestore;
window.deletePersonFromFirestore = deletePersonFromFirestore;
window.seedInitialFirestoreIfNeeded = seedInitialFirestoreIfNeeded;

// Universal aliases for closedones collection
window.fetchFavoritePeopleFromFirebase = fetchFavoritePeopleFromFirestore;
window.addFavoritePersonToFirebase = savePersonToFirestore;
window.deleteFavoritePersonFromFirebase = deletePersonFromFirestore;
window.savePersonToRealtimeDB = savePersonToFirestore;
window.fetchFavoritePeopleFromRealtimeDB = fetchFavoritePeopleFromFirestore;
window.deletePersonFromRealtimeDB = deletePersonFromFirestore;

export { 
  app, 
  analytics, 
  db, 
  storage
};
