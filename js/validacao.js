//no HTML criamos o data attributte data-tipo
//podemos criar uma função genérica que pega todos esses inputs
//e os distribui para sua função de validação
export function valida(input) {
    const tipoDeInput = input.dataset.tipo;

    if(validadores[tipoDeInput]) {
        validadores[tipoDeInput](input);
    }

    //objeto validity tem a propriedade valid
    //os inputs estão marcados como required 
    //se estiverem em branco o valor de valid: true 
    if(input.validity.valid) {
        //se estiver preenchido remove a mensagem de erro
        input.parentElement.classList.remove('input-container--invalido');
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = '';
    } else {
        //se estiver em branco exibe mensagem de erro
        input.parentElement.classList.add('input-container--invalido');
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro(tipoDeInput, input);
    }
}

//array com todos os ipos de erro
const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

//objeto com as mensagens de erro customizadas
//através das propriedades do objeto validity
const mensagensDeErro = {
    nome: {
        valueMissing: 'O campo nome não pode estar vazio',
    },
    email: {
        valueMissing: 'O campo e-mail não pode estar vazio.',
        typeMismatch: 'O endereço de e-mail inserido não é válido.'
    },
    senha: {
        valueMissing: 'O campo senha não pode estar vazio.',
        patternMismatch: 'A senha deve ter de 6 a 12 caracteres, sendo pelo menos: 1 letra maiúscula, 1 letra minúscula, 1 símbolo e não deve conter espaços.',
    },
    dataNascimento: {
        valueMissing: 'O campo data de nascimento não pode estar vazio.',
        customError: 'Você deve ter pelo menos 18 anos para se cadastrar.',
    },
    cpf: {
        valueMissing: 'O campo CPF não pode estar vazio.',
        customError: 'O CPF inserido não é válido',
    },
    cep: {
        valueMissing: 'O campo CEP não pode estar vazio.',
        patternMismatch: 'O CEP digitado não é válido.',
        customError: 'CEP não encontrado.',
    },
    logradouro: {
        valueMissing: 'O campo logradouro não pode estar vazio.'
    },
    cidade: {
        valueMissing: 'O campo cidade não pode estar vazio.'
    },
    estado: {
        valueMissing: 'O campo estado não pode estar vazio.'
    },
    preco: {
        valueMissing: 'O campo preço não pode ser vazio.'
    }
}

//objeto contendo todos os nossos tipos de inputs de validação
const validadores = {
    dataNascimento: input => validaDataNascimento(input),
    cpf: input => validaCpf(input),
    cep: input => recuperaCep(input),
}

//função para exibir mensagens de erro customizadas
//recebe como parâmetro o tipo de input que estamos escrevendo
//além do inpu em si, que nos permite acessar o objeto validity e ver o tipo de erro
function mostraMensagemDeErro(tipoDeInput, input) {
    let mensagem = '';
    //
    tiposDeErro.forEach(erro => {
        if(input.validity[erro]) {
            mensagem = mensagensDeErro[tipoDeInput][erro];
        }
    })

    return mensagem;
}

//função recebe o valor do input da data
//esse valor vem como string
//a const dataRecebida converte o valor para o padrão Date
function validaDataNascimento(inputDate) {
    const dataRecebida = new Date(inputDate.value);
    let mensagem = '';

    //chama função de verificação
    if(!verificaIdade(dataRecebida)) {
        //mensagem caso a validação retorne false
        mensagem = "Você deve ter pelo menos 18 anos para se cadastrar.";
    }
    //define que essa função está validando o formulário
    inputDate.setCustomValidity(mensagem);
}

//só permitimos cadastro de pessoas acima de 18 anos
function verificaIdade(dataRecebida) {
    const dataAtual = new Date();
    const dataMais18 = new Date(dataRecebida.getUTCFullYear() + 18, dataRecebida.getUTCMonth(), dataRecebida.getUTCDate());

    return dataMais18 <= dataAtual;
}

function validaCpf(input) {
    //o código abaixo define que
    //pegamos todos valores do input que não são dígitos
    //daí substituimos por uma string vazia, ou seja, nada
    const cpfFormatado = input.value.replace(/\D/g, '');
    let mensagem = '';

    //se o retorno da função for false, ou seja uma negação
    if(!checaCpfRepetido(cpfFormatado) || !checaEstruturaCpf(cpfFormatado)) {
        mensagem = 'O CPF inserido não é válido';
    }

    input.setCustomValidity(mensagem);
}

//um cpf válido não é assim 111.111.111-11 ou assim 222.222.222-22
//função checa se o cpf não possui todos os números repetidos
function checaCpfRepetido(cpf) {
    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]

    let cpfValido = true;

    valoresRepetidos.forEach(valor => {
        if(valor == cpf) {
            cpfValido = false;
        }
    })

    return cpfValido;
}

//checar digitos do cpf
function checaEstruturaCpf(cpf) {
    const multiplicador = 10;

    return checaDigitoVerificador(cpf, multiplicador);
}

function checaDigitoVerificador(cpf, multiplicador) {
    if (multiplicador >= 12) {
        return true
    }

    let multiplicadorInicial = multiplicador;
    let soma = 0;
    //pegando o cpf e retrando os digitos, ou seja
    //estamos pegando os 9 primeiros números
    //separando cada núemro em uma chave do array
    const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split('');
    //pegando especificamente o dígito verificador pela sua posição
    //o primeiro digito verificador é o décimo elemento do array, ou seja, na posição 9
    const digitoVerificador = cpf.charAt(multiplicador - 1);
    for (let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
       soma = soma + cpfSemDigitos[contador] * multiplicadorInicial;
       contador++;        
    }

    if(digitoVerificador == confirmaDigito(soma) || (digitoVerificador == 0 && confirmaDigito(soma) == 10)) {
        return checaDigitoVerificador(cpf, multiplicador + 1);
    }

    return false
}

function confirmaDigito(soma) {
    return 11 - (soma % 11);
}

//acessa api do via cep
function recuperaCep(input) {
    //retira qualquer formatação e envia apenas os números
    const cepFormatado = input.value.replace(/\D/g, '');

    const url = `https://viacep.com.br/ws/${cepFormatado}/json/`;

    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'content-type': 'application/json;charset=utf-8',
        }
    }
    
    if(!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url, options).then(
            response => response.json()
        ).then(
            data => {
                if (data.erro) {
                    input.setCustomValidity('CEP não encontrado.');
                    return
                }
                input.setCustomValidity('');
                preencheCamposComCep(data);
                return
            }
        )
    }
}

function preencheCamposComCep(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]');
    const cidade = document.querySelector('[data-tipo="cidade"]');
    const estado = document.querySelector('[data-tipo="estado"]');

    logradouro.value = data.logradouro;
    cidade.value = data.localidade;
    estado.value = data.uf;
}
// let soma = (10 * 2) + (9 * 0) + (8 * 2) + (7 * 6) + (6 * 9) + (5 * 1) + (4 * 4) + (3 * 9) + (2 * 8);
// console.log(soma);

// let primeiroDigitoVerficador = 11 - (soma % 11); 

// console.log(primeiroDigitoVerficador);