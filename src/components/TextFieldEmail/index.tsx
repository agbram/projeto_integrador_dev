import Form from 'react-bootstrap/Form';
import styles from './styles.module.css';

export default function FormTextPassword() {
  return (
    <>
      <Form.Label htmlFor="inputPassword5" className={styles.formLabel}>
        Email
      </Form.Label>
      <Form.Control
        type="email"
        id="inputPassword5"
        aria-describedby="passwordHelpBlock"
      />
    </>
  );
}
