export default function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      // `reader.result` pode ser string ou ArrayBuffer, então garantimos que é string
      resolve(reader.result as string);
    };

    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file); // <- converte para Base64
  });
}
