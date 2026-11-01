// إعدادات Firebase الخاصة بمشروع AHOS Academy
const firebaseConfig = {
  apiKey: "AIzaSyCUT0i_IKVfTkeVKG7Ow18SsO1_PFCVXIE",
  authDomain: "ahos-academy-dfb7d.firebaseapp.com",
  projectId: "ahos-academy-dfb7d",
  storageBucket: "ahos-academy-dfb7d.firebasestorage.app",
  messagingSenderId: "181348168968",
  appId: "1:181348168968:web:98901859a563ad9f12e8bd"
};

// تشغيل Firebase (مع حماية عشان ميعملش خطأ لو اشتغل أكتر من مرة)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); 
}
