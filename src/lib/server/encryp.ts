import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export function createKey(code: string): string {
	return createHash('sha256').update(code).digest('hex').slice(0, 32);
}

export function encrypt(text: string, key: string): string {
	const iv = randomBytes(16);

	const cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);
	const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

	return JSON.stringify({
		iv: iv.toString('base64'),
		content: encrypted.toString('base64')
	});
}

export function decrypt(json: { iv: string; content: string }, key: string): string {
	const data: { iv: Buffer; content: Buffer | string } = {
		iv: Buffer.from(json.iv, 'base64'),
		content: Buffer.from(json.content, 'base64')
	};

	const decipher = createDecipheriv('aes-256-cbc', key, data.iv);
	// Why, TypeScript, why?
	const desencrypted = decipher.update(data.content, 'base64', 'utf8') + decipher.final('utf8');

	return desencrypted;
}
