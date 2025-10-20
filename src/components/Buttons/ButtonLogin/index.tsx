import Button from 'react-bootstrap/Button';

type Props = {
  onClick(): void;
}
export default function ButtonLogin(props: Props) {

  return (
    <div className="d-grid gap-2">
      <Button variant="primary" size="lg" onClick={props.onClick}>
        Entrar
      </Button>
    </div>
  );
}