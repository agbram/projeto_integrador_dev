type Customer = {
  
  id?: number
  name: string
  document: string
  type: CustomerType
  contact: string
  email: string
  address: string
  modality: string
  ordersCount?: number;
}

export enum CustomerType{
  PF_CPF = "PF_CPF", 
  PJ_CNPJ = "PJ_CNPJ"
}

export default Customer;