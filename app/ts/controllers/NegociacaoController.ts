import { Negociacao, Negociacoes, NegociacaoParcial } from '../models/index'
import { NegociacoesView, MensagemView } from '../views/index'
import { domInject, throttle } from '../helpers/decorators/index'
import { NegociacaoService } from '../services/index'
import { Imprime } from '../helpers/Utils';

export class NegociacaoController {

    @domInject('#data')
    private _inputData: JQuery;

    @domInject('#quantidade')
    private _inputQuantidade: JQuery;

    @domInject('#valor')
    private _inputValor: JQuery;

    private _negociacoes = new Negociacoes();
    private _negociacoesView = new NegociacoesView('#negociacoesView');
    private _mensagemView = new MensagemView('#mensagemView');

    private _service = new NegociacaoService();

    constructor() {
        this._negociacoesView.update(this._negociacoes);
    }

    @throttle()
    adiciona() {

        let data = new Date(this._inputData.val().replace(/-/g, ','))

        if (data.getDay() == DiaDaSemana.Domingo || data.getDay() == DiaDaSemana.Sabado) {

            this._mensagemView.update('Somente negociacoes em dias uteis, por favor.')
            return
        }

        const negociacao = new Negociacao(
            data,
            parseInt(this._inputQuantidade.val()),
            parseFloat(this._inputValor.val())
        );

        this._negociacoes.adiciona(negociacao);



        this._negociacoesView.update(this._negociacoes);
        this._mensagemView.update('Negociação adicionada com sucesso!');

    }

    @throttle()
    async importaDados() {

        try {

            const negociacoesParaImportar = await this._service.obterNegociacao(res => {

                if (res.ok) {
                    return res
                } else {
                    throw new Error(res.statusText);
                }
            });

            const negociacoesJaImportadas = this._negociacoes.paraArray();

            negociacoesParaImportar
                .filter(negociacao =>
                    !negociacoesJaImportadas.some(jaImportada => negociacao.ehIgual(jaImportada)))
                .forEach(negociacao => this._negociacoes.adiciona(negociacao))


            this._negociacoesView.update(this._negociacoes);


        } catch (error) {
            this._mensagemView.update('Nao foi possivel importar os dados.')
            console.log(error.message);
        }

    }

    private _ehDiaUtil(data: Date) {

        return data.getDay() != DiaDaSemana.Sabado && data.getDay() != DiaDaSemana.Domingo;
    }


}

enum DiaDaSemana {

    Domingo,
    Segunda,
    Terca,
    Quarta,
    Quinta,
    Sexta,
    Sabado,

}