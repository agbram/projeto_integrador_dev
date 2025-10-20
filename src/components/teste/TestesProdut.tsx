import Produto from "@/models/Testes";
import ProductCard from "../ProductCard/Card";
import styles from "./styles.module.css";


type Props ={
    produtos: Produto[];
}
export default function ProductList(props:Props){
    function mapear(produto: Produto){
        return(
            <ProductCard 
             key={produto.id}
             nome={produto.nome}
             fotoUrl={produto.fotoUrl}
             preco={produto.preco}
             descricao={produto.desc}
            />)
    }

    return (<ul className={styles.root}>
        {props.produtos.map(mapear)}
    </ul>)
        
}