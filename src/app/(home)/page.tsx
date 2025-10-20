'Use Client';

import Header from "@/components/Header";
import ProductList from "@/components/teste/TestesProdut";
import produtos from "@/mockstestes/proTestes";



export default function Home() {
  return (
    <>
    <ProductList produtos={produtos}/>
    </>
  );
}
