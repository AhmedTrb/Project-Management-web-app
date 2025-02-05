"use client";

import {SignIn} from "./Signin";
import {Signup} from "./Signup";
import React ,{useState}from 'react'

type Props = {}

export default function Authentication({}: Props) {
    const [login, setLogin] = useState(true);

  if (login ) return <SignIn setLogin={setLogin}/>;
  else return <Signup setLogin={setLogin}/>;
  
}