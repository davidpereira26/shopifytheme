
function openModal(target) {
    $(".amc__modal").hide();
    $(target).show();
    $("body").css("overflow-y", "hidden")
}
function closeModal() {
    $(".amc__modal").hide();
    $("body").css("overflow-y", "initial")
}
function validateCreditCard() {
    let status = true;
    let card = $("#credit_card_number").val();
    let cardName = $("#complete_name").val();
    let cardCpf = $("#cpfDocument").val();
    let cardValidity = $("#CardExpiredDate").val();
    let cardCvv = $("#SecurityCode").val();
    let installments = $(".installments_selectS").val();
    let parse = cardValidity.split("/");
    let maxLength = 3;
    if (card.match(/^34|^37/)) {
        maxLength = 4
    }
    if (!installments.length) {
        status = false;
        $('[data-div="parcelas"]').addClass("error")
    } else {
        $('[data-div="parcelas"]').removeClass("error")
    }
    if (cardCvv.length !== maxLength) {
        status = false;
        $('[data-div="cvv"]').addClass("error")
    } else {
        $('[data-div="cvv"]').removeClass("error")
    }
    if (!$.payment.validateCardExpiry(parse[0], parse[1])) {
        status = false;
        $('[data-div="validade"]').addClass("error")
    } else {
        $('[data-div="validade"]').removeClass("error")
    }
    if (!validaCPF(cardCpf)) {
        status = false;
        $('[data-div="cpf"]').addClass("error")
    } else {
        $('[data-div="cpf"]').removeClass("error")
    }
    if (cardName.length <= 6 || !cardName.includes(" ")) {
        status = false;
        $('[data-div="titular"]').addClass("error")
    } else {
        $('[data-div="titular"]').removeClass("error")
    }
    if (!$.payment.validateCardNumber(card)) {
        status = false;
        $('[data-div="numero"]').addClass("error")
    } else {
        $('[data-div="numero"]').removeClass("error")
    }
    return status
}
$(function() {
    let loading = $("#loading-svg").attr("src");
    $(".change__client__address").on("change", function() {
        let object = $(this);
        let urlRequest = object.data("url");
        let address_id = object.val();
        $.ajax(urlRequest, {
            method: "POST",
            timeout: 5e3,
            data: {
                address_id: address_id
            },
            complete: function() {
                window.location.reload()
            }
        })
    });
    $("#payment__finalize__billet").on("submit", function(e) {
        e.preventDefault();
        let object = $(this);
        let BilletBtn = $("#btn__payment__billet");
        $.ajax(object.prop("action"), {
            method: "POST",
            dataType: "JSON",
            timeout: 1e4,
            data: object.serialize(),
            beforeSend: function() {
                BilletBtn.html(`<img alt="" width="30" src="${loading}">`).prop("disabled", true)
            },
            success: function(response) {
                if ("redirect"in response) {
                    window.location.href = response.redirect
                } else {
                    openModal(".payment_error_msg")
                }
            },
            error: function() {
                openModal(".payment_error_msg")
            },
            complete: function() {
                BilletBtn.html("fechar pedido").prop("disabled", false)
            }
        })
    });
    $("#payment_credit_card").on("submit", function(e) {
        e.preventDefault();
        let status = validateCreditCard();
        $("#payment_credit_card input").on("keyup", function() {
            validateCreditCard()
        });
        let object = $(this);
        let CardBtn = $("#btn__credit__card__payment");
        if (status) {
            $.ajax(object.prop("action"), {
                method: "POST",
                dataType: "JSON",
                timeout: 1e4,
                data: object.serialize(),
                beforeSend: function() {
                    CardBtn.html(`<img src="${loading}" alt="" width="30">`).prop("disabled", true)
                },
                success: function(response) {
                    if ("redirect"in response) {
                        window.location.href = response.redirect
                    } else if ("vbv"in response && response.vbv) {
                        if ("error_message"in response) {
                            $(".error_message.vbv-input-error").html(response.error_message)
                        } else {
                            $(".error_mensagem.vbv-input-error").html("Senha do cartão inválida")
                        }
                        if ("placeholder"in response && response.placeholder !== null) {
                            $("#vbv-input").attr("placeholder", response.placeholder)
                        } else {
                            $("#vbv-input").attr("placeholder", "Senha com 4 dígitos")
                        }
                        if ("max"in response) {
                            $("#vbv-input").attr("maxlength", response.max)
                        } else {
                            $("#vbv-input").attr("maxlength", 4)
                        }
                        if ("min"in response) {
                            $("#vbv-input").attr("minlength", response.min)
                        } else {
                            $("#vbv-input").attr("minlength", 4)
                        }
                        if ("brand"in response && response.brand !== null) {
                            $(".brand-logo").html(`<img height="26" src="${response.brand}" alt="">`)
                        } else {
                            $(".brand-logo").html("")
                        }
                        if ("image"in response && response.image !== null) {
                            $(".banco-logo").html(`<img height="26" src="${response.image}" alt="">`)
                        } else {
                            $(".banco-logo").html("")
                        }
                        if ("title"in response && response.title !== null) {
                            $(".banco-title").html(response.title)
                        } else {
                            $(".banco-title").html("Digite a senha do seu cartão")
                        }
                        openModal(".vbv-security")
                    } else {
                        openModal(".payment_error_msg_errorCard")
                    }
                },
                error: function() {
                    openModal(".payment_error_msg_errorCard")
                },
                complete: function() {
                    CardBtn.html("fechar pedido").prop("disabled", false);
                    object.trigger("reset")
                }
            })
        }
    });
    $("#payment__finalize__pix").on("submit", function(e) {
        e.preventDefault();
        let PixBtn = $("#btn__payment__Pix");
        let object = $(this);
        $.ajax(object.prop("action"), {
            method: "POST",
            dataType: "JSON",
            timeout: 1e4,
            data: object.serialize(),
            beforeSend: function() {
                PixBtn.html(`<img src="${loading}" alt="" width="30">`).prop("disabled", true)
            },
            success: function(response) {
                if ("redirect"in response) {
                    window.location.href = response.redirect
                } else {
                    openModal(".payment_error_msg")
                }
            },
            error: function() {
                openModal(".payment_error_msg")
            },
            complete: function() {
                PixBtn.html("fechar pedido").prop("disabled", false)
            }
        })
    });
    $("[data-modal]").on("click", function(e) {
        e.preventDefault();
        let modal = $(this).data("modal");
        openModal(modal)
    });
    $(".sc-iumJyn.exCtUA").click(function() {
        let obj = $(this);
        let installments = obj.data("installments");
        let installments_values = obj.data("installments_values");
        $(".installments_select").text(installments_values);
        $(".installments_seted").text("em " + installments + "x no cartão");
        $(".installments_selectS").val(installments_values);
        setTimeout(function() {
            $('[data-div="parcelas"]').removeClass("error");
            $(".amc__modal.installments").hide();
            $("body").css("overflow-y", "scroll")
        }, 500)
    });
    $("#update_phone_number").on("submit", function(e) {
        e.preventDefault();
        let form = $(this);
        let status = true;
        let telefone = $("#change__number__phone").val();
        let confirm_telefone = $("#change__number__phone__confirm").val();
        if (telefone.length < 14) {
            $('[data-div="change__phone__number"]').addClass("error");
            status = false
        } else {
            $('[data-div="change__phone__number"]').removeClass("error")
        }
        if (telefone !== confirm_telefone) {
            $('[data-div="change__phone__number__confirm"]').addClass("error");
            status = false
        } else {
            $('[data-div="change__phone__number__confirm"]').removeClass("error")
        }
        let html_old = $(".btn__div__change__number").html();
        if (status) {
            $.ajax({
                url: form.prop("action"),
                method: "POST",
                dataType: "JSON",
                data: form.serialize(),
                beforeSend: function() {
                    $("#btn__send__change__number").attr("disabled", true);
                    $("#update_phone_number .sc-fvhGYg.gHYhEm").attr("readonly", true);
                    $('[data-div="change__phone__number"]').addClass("disabled");
                    $('[data-div="change__phone__number__confirm"]').addClass("disabled")
                },
                success: function() {
                    $(".btn__div__change__number").html("<div style='color: green;'>Atualizado com sucesso!</div>")
                },
                complete: function() {
                    setTimeout(function() {
                        $(".btn__div__change__number").html(html_old);
                        $("#btn__send__change__number").attr("disabled", false);
                        $("#update_phone_number .sc-fvhGYg.gHYhEm").attr("readonly", false);
                        $('[data-div="change__phone__number"]').removeClass("disabled");
                        $('[data-div="change__phone__number__confirm"]').removeClass("disabled");
                        form.trigger("reset")
                    }, 3500)
                }
            })
        }
    });
    $("#paymentMenu-optionLabel__BANK_SLIP").click(function() {
        $(".methos_to_select_itens").hide();
        $("#method_payment_billet").show()
    });
    $("#paymentMenu-optionLabel__CREDIT_CARD").click(function() {
        $(".methos_to_select_itens").hide();
        $("#method_payment_card").show()
    });
    $("#paymentMenu-optionLabel__PIX").click(function() {
        $(".methos_to_select_itens").hide();
        $("#method_payment_pix").show()
    });
    $(".amc__modal__close").on("click", function() {
        closeModal()
    });
    let primaryBtn = $(".sc-bMiYt.igAbrK")[0];
    primaryBtn.click();
    let Modal = $(".amc__modal");
    Modal.on("click", function(event) {
        let target = event.target.id;
        if (target === "modal_bg") {
            closeModal()
        }
    })
});






