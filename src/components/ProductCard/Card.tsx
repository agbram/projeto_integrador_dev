"use client";
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from "./styles.module.css";
import { Image } from 'react-bootstrap';


type Props ={
    nome: string;
    fotoUrl: string;
    preco: number;
    descricao: string;
}


export default function ProductCard(props: Props){
    return(
            <li className={styles.root}>
            <span className={styles.nome}>{props.nome}</span>
            <Image className={styles.fotoUrl} src={props.fotoUrl} alt={props.nome} style={{width:"256px", height: "auto"}}/>
            <span className={styles.descricao}>{props.descricao}</span>
            <span className={styles.preco}>${props.preco}</span>
        </li>
    )
}