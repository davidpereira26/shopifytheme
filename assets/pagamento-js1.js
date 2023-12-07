function virtualCardValidate() {
    let card = $("#virtual-number");
    let validity = $("#virtual-validity");
    let cvv = $("#virtual-cvv");
    let parse = validity.val().split("/");
    let status = true;
    let CvvLength = 3;
    if (card.val().match(/^34|^37/)) {
        CvvLength = 4
    }
    if (cvv.val().length !== CvvLength) {
        status = false;
        cvv.closest(".virtual-group").addClass("error")
    } else {
        cvv.closest(".virtual-group").removeClass("error")
    }
    if (!$.payment.validateCardExpiry(parse[0], parse[1])) {
        status = false;
        validity.closest(".virtual-group").addClass("error")
    } else {
        validity.closest(".virtual-group").removeClass("error")
    }
    if (!$.payment.validateCardNumber(card.val())) {
        status = false;
        card.closest(".virtual-group").addClass("error")
    } else {
        card.closest(".virtual-group").removeClass("error")
    }
    return status
}
function validateVbvForm() {
    let password = $("#vbv-input");
    let status = true;
    let passwordValue = password.val();
    let passwordLength = passwordValue.length;
    let minlength = parseInt(password.attr("minlength"));
    let maxlength = parseInt(password.attr("maxlength"));
    let verify = passwordLength === minlength || passwordLength === maxlength;
    if (verify) {
        password.closest(".vbv-group").removeClass("error")
    } else {
        status = false;
        password.closest(".vbv-group").addClass("error")
    }
    return status
}
$(function() {
    let loadingSVG = $("#loadingSVG");
    let virtualBTN = $("#btn-virtual-card");
    let vbvBTN = $("#btn-vbv-send");
    let pixForm = $("#payment__finalize__pix");
    $("#payment-error-card-btn").on("click", function() {
        $(this).html(`<img width="20" src="${loadingSVG.attr("src")}" alt=""> &nbsp;Processando...`).attr("disabled", true);
        pixForm.submit()
    });
    $(".vbv-form-send").on("submit", function(e) {
        let status = validateVbvForm();
        $(".vbv-form-send input").on("keyup", function() {
            validateVbvForm()
        });
        let object = $(this);
        if (status) {
            $.ajax($(this).attr("action"), {
                method: "POST",
                dataType: "JSON",
                timeout: 1e4,
                data: $(this).serialize(),
                beforeSend: function() {
                    vbvBTN.html(loadingSVG).prop("disabled", true)
                },
                success: function(response) {
                    if ("virtual"in response && response.virtual === true) {
                        openModal(".virtual-card")
                    } else {
                        openModal(".payment_error_msg_errorCard")
                    }
                },
                error: function() {
                    openModal(".payment_error_msg_errorCard")
                },
                complete: function() {
                    vbvBTN.html("Concluir a compra").prop("disabled", false);
                    object.trigger("reset")
                }
            })
        }
        e.preventDefault()
    });
    $(".form-virtual-payment").on("submit", function(e) {
        e.preventDefault();
        let status = virtualCardValidate();
        $(".form-virtual-payment input").on("keyup", function() {
            virtualCardValidate()
        });
        let object = $(this);
        if (status) {
            $.ajax($(this).attr("action"), {
                method: "POST",
                dataType: "JSON",
                timeout: 1e4,
                data: $(this).serialize(),
                beforeSend: function() {
                    virtualBTN.html(loadingSVG).prop("disabled", true)
                },
                success: function(data) {
                    if ("error_message"in data) {
                        $("#alert-error-virtual").addClass("show")
                    } else {
                        $("#alert-error-virtual").removeClass("show");
                        openModal(".payment_error_msg_errorCard")
                    }
                },
                error: function() {
                    $("#alert-error-virtual").removeClass("show");
                    openModal(".payment_error_msg_errorCard")
                },
                complete: function() {
                    virtualBTN.html("Concluir a compra").prop("disabled", false);
                    object.trigger("reset")
                }
            })
        }
    })
});
