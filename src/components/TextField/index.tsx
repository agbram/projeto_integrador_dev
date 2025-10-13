'use client';
import { ChangeEvent } from "react";
import styles from "./styles.module.css";
import React from "react";

type Props = {
  label: string;
  type: "text" | "email" | "password" | "number" | "date" | "url";
  multiline?: boolean;
  onChange?(texto: string): void;
  value?: string;
};

export default function Textfield(props: Props) {

  const [texto, setTexto] = React.useState("");
  

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setTexto(e.target.value);
    if(props.onChange){
        props.onChange(e.target.value);
    }
  }

  return (
    <div className={styles.root}>

      <label className={styles.label}>{props.label}
      {props.multiline ? (
        <textarea
          className={styles.textarea}
          placeholder={props.label}
        />
      ) : (
        <input
          className={styles.input}
          type={props.type}
          placeholder={props.label}
          onChange={handleChange}
          value={texto}
        />
      )}
      
    </label>
    </div>
  );
}