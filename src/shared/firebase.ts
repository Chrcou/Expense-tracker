import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { firebaseConfig } from './env';

const config=firebaseConfig
firebase.initializeApp(config)


export const db=firebase.firestore();