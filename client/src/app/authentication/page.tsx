"use client";
import Login from '@/components/Login/Login';
import { SignIn } from '@/components/Signin';
import { Signup } from '@/components/Signup';
import React ,{useState}from 'react'

type Props = {}

export default function Authentication({}: Props) {
    const [login, setLogin] = useState(true);

  if (login ) return <SignIn setLogin={setLogin}/>;
  else return <Signup setLogin={setLogin}/>;
  
}