const phrases = [
	'"No fuisteis criados para vivir como bestias, sino para seguir en pos de la virtud y la sabiduría".\n\nDante Alighieri.\n',
	'"La pasión es energía. Siente el poder que viene de centrarte en lo que te excita".\n\nOprah Winfrey\n',
	'"La cultura se adquiere leyendo libros; pero el conocimiento del mundo, que es mucho más necesario, sólo se alcanza leyendo a los hombres y estudiando las diversas ediciones que de ellos existen".\n\nLord Chesterfield.\n',
	'"No se trata de donde vienes, sino de donde vas".\n\nElla Fitzgerald.\n',
	'"Nunca consideres el estudio como una obligación, sino como una oportunidad para penetrar en el bello y maravilloso mundo del saber".\n\nAlbert Einstein.\n',
	'"Dime y lo olvido, enséñame y lo recuerdo, involúcrame y lo aprendo".\n\nBenjamin Franklin.\n',
	'"Los sabios son los que buscan la sabiduría; los necios piensan ya haberla encontrado".\n\nNapoleón Bonaparte.\n',
	'"Con mis maestros he aprendido mucho; con mis colegas, más; con mis alumnos todavía más".\n\nProverbio hindú.\n',
	'"Fuera del perro, un libro es probablemente el mejor amigo del hombre, y dentro del perro probablemente está demasiado oscuro para leer".\n\nGroucho Marx.\n',
	'"Aprender es como remar contra corriente: en cuanto se deja, se retrocede".\n\nEdward Benjamin Britten.\n',
	'"Encuentro la televisión muy educativa. Cada vez que alguien la enciende, me retiro a otra habitación y leo un libro".\n\nGroucho Marx.\n',
	'"Me lo contaron y lo olvidé; lo vi y lo entendí; lo hice y lo aprendí".\n\nConfucio.\n',
	'"La inteligencia consiste no solo en el conocimiento, sino también en la destreza de aplicar los conocimientos en la práctica".\n\nAristóteles.\n',
	'"Aprender sin reflexionar es una ocupación inútil".\n\nConfucio.\n',
	'"Lo que con mucho trabajo se adquiere, más se ama".\n\nAristóteles.\n',
	'"Yo no enseño a mis alumnos, solo les proporciono las condiciones en las que puedan aprender".\n\nAlbert Einstein.\n',
	'"Hay la misma diferencia entre un sabio y un ignorante que entre un hombre vivo y un cadáver".\n\nAristóteles.\n',
	'"El aprendizaje es un simple apéndice de nosotros mismos; dondequiera que estemos, está también nuestro aprendizaje".\n\nWilliam Shakespeare.\n',
	'"La sabiduría es un adorno en la prosperidad y un refugio en la adversidad".\n\nAristoteles.\n',
	'"Todo hombre que conozco es superior a mí en algún sentido. En ese sentido, aprendo de él".\n\nRalph Waldo Emerson.\n',
	'"El verdadero discípulo es el que supera al maestro".\n\nAristóteles\n',
	'"El colmo de la estupidez es aprender lo que luego hay que olvidar".\n\nErasmo de Rotterdam.\n',
	'"Adquirir desde jóvenes tales o cuáles hábitos no tiene poca importancia: tiene una importancia absoluta".\n\nAristóteles.\n',
	'"Si quieres aprender, enseña."\n\nCicerón.\n'
];

export default function motivation(): string {
	return phrases[(Math.random() * phrases.length) | 0];
}
