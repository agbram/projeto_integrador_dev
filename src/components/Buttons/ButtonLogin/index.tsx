import styles from "./styles.module.css"

type Props = {
  onClick?(): void;
  type?: "button" | "submit" | "reset"
}
export default function ButtonLogin(props: Props) {

  return (
    <div className="d-grid gap-2">
      <button onClick={props.onClick} type={props.type || "button"} className={styles.button}>
        Entrar
      </button>
    </div>
  );
}