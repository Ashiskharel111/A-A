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
      { name: "Akiko Watanabe", role: "Mother of the Bride", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/guest piccs/facecover/akochan.jpeg", togetherImg: "assets/guest piccs/insidephoto/akochan.png", photos: ["assets/guest piccs/insidephoto/akochan.png"], note: "Ayaka's loving mother, the heart and warmth of the Watanabe family home." },
      { name: "Mr Watanabe", role: "Father of the Bride", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/guest piccs/facecover/bride'Sfather(kunihisa).jpeg", togetherImg: "assets/guest piccs/insidephoto/kunihisa.png", photos: ["assets/guest piccs/insidephoto/kunihisa.png"], note: "Ayaka's supportive and proud father, guiding with boundless love and wisdom." },
      { name: "Ryoma Watanabe", role: "Brother", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/guest piccs/facecover/ryoma.jpeg", togetherImg: "assets/guest piccs/insidephoto/ryoma.png", photos: ["assets/guest piccs/insidephoto/ryoma.png"], note: "Ayaka's brother, lifelong companion and trusted confidant." },
      { name: "Tamaki Watanabe", role: "Sister in Law", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/guest piccs/facecover/tamaki.jpeg", togetherImg: "assets/guest piccs/insidephoto/tamaki.png", photos: ["assets/guest piccs/insidephoto/tamaki.png"], note: "Brings endless warmth, happiness, and sisterly bond to our family." },
      { name: "Shio Watanabe", role: "Nephew", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/guest piccs/facecover/shio.jpeg", togetherImg: "assets/guest piccs/insidephoto/shio.png", photos: ["assets/guest piccs/insidephoto/shio.png"], note: "Beloved nephew bringing endless smiles and playful energy to every family reunion." },
      { name: "Sou Watanabe", role: "Nephew", side: "bride", category: "family", relationship: "Ayaka's Family", avatarImg: "assets/guest piccs/facecover/so.jpeg", togetherImg: "assets/guest piccs/insidephoto/so.png", photos: ["assets/guest piccs/insidephoto/so.png"], note: "Beloved nephew whose bright laughter and sweetness light up our home." },
      { name: "Mimi", role: "Family Cat", side: "bride", category: "family", relationship: "Ayaka's Family • Pet", avatarImg: "assets/guest piccs/facecover/mimi.jpeg", togetherImg: "assets/guest piccs/insidephoto/mimi.png", photos: ["assets/guest piccs/insidephoto/mimi.png"], note: "The adorable feline queen of the household, master of cozy naps." },
      { name: "Lala", role: "Family Cat", side: "bride", category: "family", relationship: "Ayaka's Family • Pet", avatarImg: "assets/guest piccs/facecover/Lala.jpeg", togetherImg: "assets/guest piccs/insidephoto/Lala.png", photos: ["assets/guest piccs/insidephoto/Lala.png"], note: "Sweet and curious family cat who brings purrs and warmth everywhere." },
      { name: "Merun", role: "Family Dog", side: "bride", category: "family", relationship: "Ayaka's Family • Pet", avatarImg: "assets/guest piccs/facecover/merun.jpeg", togetherImg: "assets/guest piccs/insidephoto/merun(right).png", photos: ["assets/guest piccs/insidephoto/merun(right).png"], note: "Loyal and energetic family pup, always ready for tail-wagging adventures." },
      { name: "Perun", role: "Family Dog", side: "bride", category: "family", relationship: "Ayaka's Family • Pet", avatarImg: "assets/guest piccs/facecover/peron.jpeg", togetherImg: "assets/guest piccs/insidephoto/peron(left).png", photos: ["assets/guest piccs/insidephoto/peron(left).png"], note: "Playful and cuddly furry companion bringing pure joy to our days." },

      // Ayaka's Friends
      { name: "Makisi Ayaka", role: "Close Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/guest piccs/facecover/makishi.png", togetherImg: "assets/guest piccs/insidephoto/nanaha.png", photos: ["assets/guest piccs/insidephoto/nanaha.png"], note: "Cherished friend who brings wonderful memories, laughter, and support." },
      { name: "Makisi mama", role: "Family Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/guest piccs/facecover/makishi mama.jpeg", togetherImg: "assets/guest piccs/facecover/makishi mama.jpeg", photos: ["assets/guest piccs/facecover/makishi mama.jpeg"], note: "Dear family friend bringing immense love, blessing, and joyful memories." },
      { name: "Elvina", role: "Close Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/guest piccs/facecover/elvina.jpeg", togetherImg: "assets/guest piccs/insidephoto/elvina.png", photos: ["assets/guest piccs/insidephoto/elvina.png"], note: "Wonderful friend welcomed with open arms into our joyful celebration." },
      { name: "RIKO", role: "Close Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/guest piccs/facecover/riko.jpeg", togetherImg: "assets/guest piccs/insidephoto/riko.png", photos: ["assets/guest piccs/insidephoto/riko.png"], note: "Dear friend who has shared so many unforgettable moments and milestones." },
      { name: "Sakiho", role: "Close Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/guest piccs/facecover/sakiho(left).jpeg", togetherImg: "assets/guest piccs/insidephoto/sakiho.png", photos: ["assets/guest piccs/insidephoto/sakiho.png"], note: "Always bringing smiles, deep conversations, and uplifting positive energy." },
      { name: "Chiaki", role: "Close Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/guest piccs/facecover/chiaki.jpeg", togetherImg: "assets/guest piccs/insidephoto/chiaki(right).png", photos: ["assets/guest piccs/insidephoto/chiaki(right).png"], note: "Trusted friend and confidante for life talks and fun celebrations." },
      { name: "Andrea", role: "Close Friend", side: "bride", category: "friends", relationship: "Bride's Friend", avatarImg: "assets/guest piccs/facecover/andrea.jpeg", togetherImg: "assets/guest piccs/insidephoto/andrea.png", photos: ["assets/guest piccs/insidephoto/andrea.png"], note: "Wonderful friend sharing unforgettable adventures and warm companionship." },

      // Ashis's Family
      { name: "Mina Kharel", role: "Mother of the Groom", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/guest piccs/facecover/minakharel.heic.jpg", togetherImg: "assets/guest piccs/insidephoto/parents.jpg", photos: ["assets/guest piccs/insidephoto/parents.jpg"], note: "Ashis's loving mother, a pillar of care, warmth, and unconditional devotion." },
      { name: "Prajapati Kharel", role: "Father of the Groom", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/guest piccs/facecover/prajapatikharel.JPG", togetherImg: "assets/guest piccs/insidephoto/prajapatikharel.JPG", photos: ["assets/guest piccs/insidephoto/prajapatikharel.JPG"], note: "Ashis's guiding father, inspiring with wisdom, strength, and integrity." },
      { name: "Ayush Kharel", role: "Brother", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/guest piccs/facecover/ayush.png.jpg", togetherImg: "assets/guest piccs/insidephoto/ayush.png.jpg", photos: ["assets/guest piccs/insidephoto/ayush.png.jpg"], note: "Inseparable brother and best friend through every chapter of life." },
      { name: "Grandparents", role: "Beloved Grandparents", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/guest piccs/facecover/grandparents.jpg", togetherImg: "assets/guest piccs/insidephoto/grandparents(cover).jpg", photos: ["assets/guest piccs/insidephoto/grandparents(cover).jpg"], note: "Our cherished elders whose blessings and love guide our journey." },
      { name: "Shiva Kharel", role: "Uncle", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/guest piccs/facecover/shivakharel.jpg", togetherImg: "assets/guest piccs/insidephoto/shivakharel.jpg", photos: ["assets/guest piccs/insidephoto/shivakharel.jpg"], note: "Respected uncle bringing wisdom, support, and family pride." },
      { name: "Kalpana Kharel", role: "Aunt", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/guest piccs/facecover/kalpanakharel.jpg", togetherImg: "assets/guest piccs/facecover/kalpanakharel.jpg", photos: ["assets/guest piccs/facecover/kalpanakharel.jpg"], note: "Loving aunt whose warmth and care brighten every family gathering." },
      { name: "Prabesh Kharel", role: "Cousin", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/guest piccs/facecover/prabesh.jpeg", togetherImg: "assets/guest piccs/insidephoto/prabesh.cover.png.jpg", photos: ["assets/guest piccs/insidephoto/prabesh.cover.png.jpg"], hiddenImg: "assets/guest piccs/insidephoto/prabesh.hidden.jpg", note: "Cousin and close buddy sharing laughter, brotherhood, and memories." },
      { name: "Prasansha Kharel", role: "Cousin", side: "groom", category: "family", relationship: "Ashis's Family", avatarImg: "assets/guest piccs/facecover/prasansa.jpg", togetherImg: "assets/guest piccs/insidephoto/Prasansha.png.jpg", photos: ["assets/guest piccs/insidephoto/Prasansha.png.jpg"], note: "Wonderful cousin who brings joy, smiles, and sweetness to the family circle." },

      // Ashis's Friends
      { name: "Ryo", role: "Close Friend", side: "groom", category: "friends", relationship: "Groom's Friend", avatarImg: "assets/guest piccs/facecover/ryo..jpg", togetherImg: "assets/guest piccs/insidephoto/Ryo.cover.jpg", photos: ["assets/guest piccs/insidephoto/Ryo.cover.jpg"], note: "Great buddy for travel adventures, gatherings, and unforgettable times." },
      { name: "ChaCha", role: "Close Friend", side: "groom", category: "friends", relationship: "Groom's Friend", avatarImg: "assets/guest piccs/facecover/chacha.jpg", togetherImg: "assets/guest piccs/insidephoto/chachacover.JPG", photos: ["assets/guest piccs/insidephoto/chachacover.JPG"], note: "Valued friend always bringing great energy and memorable moments." },
      { name: "Sandesh", role: "Childhood Friend", side: "groom", category: "friends", relationship: "Groom's Friend", avatarImg: "assets/guest piccs/facecover/sandesh.jpeg", togetherImg: "assets/guest piccs/insidephoto/sandesh.heic.jpg", photos: ["assets/guest piccs/insidephoto/sandesh.heic.jpg"], hiddenImg: "assets/guest piccs/insidephoto/subhahidden.png", note: "Childhood friend through the years, sharing roots and lifelong brotherhood." },
      { name: "Aditya", role: "Childhood Friend", side: "groom", category: "friends", relationship: "Groom's Friend", avatarImg: "assets/guest piccs/facecover/20190330_193606.jpg", togetherImg: "assets/guest piccs/insidephoto/Screenshot_20210129-134711_Facebook.jpg", photos: ["assets/guest piccs/insidephoto/Screenshot_20210129-134711_Facebook.jpg"], note: "Childhood friend who grew up together through all life's adventures." },

      // Mutual / Shared Friends
      { name: "Ishwor", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/guest piccs/facecover/ish.jpeg", togetherImg: "assets/guest piccs/insidephoto/ish.png", photos: ["assets/guest piccs/insidephoto/ish.png"], note: "Trusted mutual friend who brings great camaraderie and joy to both of us." },
      { name: "Nabin", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/guest piccs/facecover/nabin.png.jpg", togetherImg: "assets/guest piccs/insidephoto/nabin.png.jpg", photos: ["assets/guest piccs/insidephoto/nabin.png.jpg"], note: "Always bringing laughter, high energy, and genuine warmth to every meetup." },
      { name: "Sandip", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/guest piccs/facecover/sandip.heic.jpg", togetherImg: "assets/guest piccs/insidephoto/ish:sandip:nabin cover.heic.jpg", photos: ["assets/guest piccs/insidephoto/ish:sandip:nabin cover.heic.jpg"], note: "Great friend and adventure buddy through mountain trails and celebrations." },
      { name: "Kristian", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/guest piccs/facecover/kristian.jpeg", togetherImg: "assets/guest piccs/insidephoto/kristian.png", photos: ["assets/guest piccs/insidephoto/kristian.png"], note: "Wonderful friend sharing great conversations and memorable gatherings." },
      { name: "Rumon", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/guest piccs/facecover/rumon.heic.jpg", togetherImg: "assets/guest piccs/insidephoto/rumon(cover).jpg", photos: ["assets/guest piccs/insidephoto/rumon(cover).jpg"], note: "Reliable friend and the life of every reunion and get-together." },
      { name: "Iman", role: "Mutual Friend", side: "shared", category: "friends", relationship: "Our Shared Circle", avatarImg: "assets/guest piccs/facecover/iman.jpeg", togetherImg: "assets/guest piccs/insidephoto/iman.png", photos: ["assets/guest piccs/insidephoto/iman.png"], note: "Cherished mutual friend whose presence makes every occasion special." }
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
