package di.avi.core.encryption;

import org.apache.commons.codec.binary.Hex;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.AlgorithmParameters;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;


// http://stackoverflow.com/questions/992019/java-256-bit-aes-password-based-encryption
// http://stackoverflow.com/questions/1709441/generate-rsa-key-pair-and-encode-private-as-string

// Share the password (a char[]) and salt (a byte[]—8 bytes selected by a SecureRandom makes a good salt—which doesn't need to be kept secret) with the recipient out-of-band. Then to derive a good key from this information:
///* Derive the key, given password and salt. */
//SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
//        KeySpec spec = new PBEKeySpec(password, salt, 65536, 256);
//        SecretKey tmp = factory.generateSecret(spec);
//        SecretKey secret = new SecretKeySpec(tmp.getEncoded(), "AES");
//        The magic numbers (which could be defined as constants somewhere) 65536 and 256 are the key derivation iteration count and the key size, respectively.
//
//        The key derivation function is iterated to require significant computational effort, and that prevents attackers from quickly trying many different passwords. The iteration count can be changed depending on the computing resources available.
//
//        The key size can be reduced to 128 bits, which is still considered "strong" encryption, but it doesn't give much of a safety margin if attacks are discovered that weaken AES.
//
//        Used with a proper block-chaining mode, the same derived key can be used to encrypt many messages. In CBC, a random initialization vector (IV) is generated for each message, yielding different cipher text even if the plain text is identical. CBC may not be the most secure mode available to you (see AEAD below); there are many other modes with different security properties, but they all use a similar random input. In any case, the outputs of each encryption operation are the cipher text and the initialization vector:
//
///* Encrypt the message. */
//        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
//        cipher.init(Cipher.ENCRYPT_MODE, secret);
//        AlgorithmParameters params = cipher.getParameters();
//        byte[] iv = params.getParameterSpec(IvParameterSpec.class).getIV();
//        byte[] ciphertext = cipher.doFinal("Hello, World!".getBytes("UTF-8"));
//        Store the ciphertext and the iv. On decryption, the SecretKey is regenerated in exactly the same way, using using the password with the same salt and iteration parameters. Initialize the cipher with this key and the initialization vector stored with the message:
//
///* Decrypt the message, given derived key and initialization vector. */
//        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
//        cipher.init(Cipher.DECRYPT_MODE, secret, new IvParameterSpec(iv));
//        String plaintext = new String(cipher.doFinal(ciphertext), "UTF-8");
//        System.out.println(plaintext);
//        Java 7 included API support for AEAD cipher modes, and the "SunJCE" provider included with OpenJDK and Oracle distributions implements these beginning with Java 8. One of these modes is strongly recommended in place of CBC; it will protect the integrity of the data as well as their privacy.
//
//        A java.security.InvalidKeyException with the message "Illegal key size or default parameters" means that the cryptography strength is limited; the unlimited strength jurisdiction policy files are not in the correct location. In a JDK, they should be placed under ${jdk}/jre/lib/security
//
//        Based on the problem description, it sounds like the policy files are not correctly installed. Systems can easily have multiple Java runtimes; double-check to make sure that the correct location is being used.
//

public class Keys {

    public static final String AES_CBC_PKCS5_PADDING = "AES/CBC/PKCS5Padding";

    public static List<Key> generate(int num, int size) {
        try {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
            keyGen.initialize(size);
            return IntStream.range(1, 3).mapToObj(i -> {
                KeyPair keyPair = keyGen.genKeyPair();
                return new Key(keyPair.getPublic().getEncoded(), keyPair.getPrivate().getEncoded());
            }).collect(Collectors.toList());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public static byte[] generateMasterKey(String password, String salt) {
        try {
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            KeySpec spec = new PBEKeySpec(password.toCharArray(), salt.getBytes(), 65536, 256);
            SecretKey tmp = factory.generateSecret(spec);
            SecretKey secret = new SecretKeySpec(tmp.getEncoded(), "AES");
            return secret.getEncoded();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new RuntimeException(e);
        }
    }

    public static EncryptedData encryptWithMaster(byte[] key, byte[] data) {
        try {
            SecretKey secret = new SecretKeySpec(key, "AES");
            Cipher cipher = Cipher.getInstance(AES_CBC_PKCS5_PADDING);
            cipher.init(Cipher.ENCRYPT_MODE, secret);
            AlgorithmParameters params = cipher.getParameters();
            byte[] iv = params.getParameterSpec(IvParameterSpec.class).getIV();
            return new EncryptedData(cipher.doFinal(data), iv);
        } catch (Exception  e) {
            throw new RuntimeException(e);
        }
    }

    public static byte[] decryptWithMaster(byte[] key, EncryptedData data) {
        try {
            SecretKey secret = new SecretKeySpec(key, "AES");
            Cipher cipher = Cipher.getInstance(AES_CBC_PKCS5_PADDING);
            cipher.init(Cipher.DECRYPT_MODE, secret, new IvParameterSpec(data.getIv()));
            return cipher.doFinal(data.getData());
        } catch (Exception  e) {
            throw new RuntimeException(e);
        }
    }

    public static byte[] fromEncriptedData(Keys.EncryptedData data) {
        return ByteBuffer.allocate(data.getData().length + 4 + data.getIv().length + 4)
                .putInt(data.getData().length)
                .put(data.getData())
                .putInt(data.getIv().length)
                .put(data.getIv())
                .array();
    }

    public static Keys.EncryptedData toEncryptedData(byte[] beatData) {
        ByteBuffer byteBuffer = ByteBuffer.wrap(beatData);
        int dataSize = byteBuffer.getInt();
        byte[] data = new byte[dataSize];
        byteBuffer.get(data);
        int ivSize = byteBuffer.getInt();
        byte[] iv = new byte[ivSize];
        byteBuffer.get(iv);
        return new Keys.EncryptedData(data, iv);
    }

    public static class Key {
        private byte[] publicKey;
        private byte[] privateKey;

        public Key(byte[] publicKey, byte[] privateKey) {
            this.publicKey = publicKey;
            this.privateKey = privateKey;
        }

        public byte[] getPublicKey() {
            return publicKey;
        }

        public byte[] getPrivateKey() {
            return privateKey;
        }
    }

    public static class EncryptedData {
        private byte[] data;
        private byte[] iv;

        public EncryptedData() {
        }

        public EncryptedData(byte[] data, byte[] iv) {
            this.data = data;
            this.iv = iv;
        }

        public byte[] getData() {
            return data;
        }

        public byte[] getIv() {
            return iv;
        }
    }
}
