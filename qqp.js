elements = {};
iframe = {};
bin = "";
PageParams = {};
isMobile = false;
var isSubmitted = false;
var nativeEventsEnabled = true;
var trackingEventsService = {};
var casApiUrl = "";
var supportedCards = ["visa", "masterCard", "americanExpress", "discover"];
var errorsDictionary = { "CreditCard": false, "PayPal": false, "GooglePay": false };
var countriesData = [];

$(document).ready(function () {

    PageParams = GetPageParamsFromCookie();
    nativeEventsEnabled = NativeEventsSupported();

    casApiUrl = PageParams.SiteId === 2 ? "https://api.prestoexperts.com" : "https://api.kasamba.com";
    
    if (LP && LP.services && LP.services.TrackingEventsService) {
        trackingEventsService = new LP.services.TrackingEventsService(casApiUrl);
    }

    var formType = ["full", "short", "short_extended"];
    pushNativeEvent("billing_page_load", { billing_form_type: formType[PageParams.QQPMode] });

    var analyticsPageLoadData = buildTrackingPageLoadParams(PageParams);
    dataLayerService.pushEvent("page_load", analyticsPageLoadData);

    pushTrackingEvents(
        createQqpTestEvent(28, "QQPPageLoad"),
        createCustomPageTestEvent("PaymentMethodPageLoad1"),
        createGooglePayEvent("LoadedWITHOUTGooglePay", "LoadedWithGooglePay"));

    configureFormValidation();
    LoadPaypalAmounts();
    var formSubmitAction;
    var favicon = document.getElementById('favicon');

    switch (PageParams.SiteId) {
        case 2: // presto web 
            //change style to Presto
            $("body").addClass("presto").removeClass("kasamba");
            $(".logo-img").attr("src", "img/Logo-presto.svg");
            $(".logo-link").attr("href", "https://www.prestoexperts.com");
            formSubmitAction = "https://www.prestoexperts.com/Billing/quick-payment-handler.ashx";
            favicon.href = "img/faviconPresto.ico";
            $("#loader img").attr("src", "img/p-spinner.gif");
            applyDesktopStyles();
            break;

        case 5:
        case 6:
        case 7:
        case 8:
        case 9: // touch, native or tablet
            $(".logo-img").attr("src", "//siteimages.kassrv.com/images/Kasamba/logo/Kasamba_Logo_2020.svg");
            formSubmitAction = "https://touch.kasamba.com/pages/Billing/quick-payment-handler.ashx";
            $(".logo-link").attr("href", "https://touch.kasamba.com");
            isMobile = true;
            favicon.href = "img/faviconKasamba.ico";
            applyMobileStyles();
            break;

        default: //kasamba web or anything else
            $(".logo-img").attr("src", "//siteimages.kassrv.com/images/Kasamba/logo/Kasamba_Logo_2020.svg");
            formSubmitAction = "https://www.kasamba.com/Billing/quick-payment-handler.ashx";
            $(".logo-link").attr("href", "https://www.kasamba.com");
            favicon.href = "img/faviconKasamba.ico";
            applyDesktopStyles();
            break;
    }

    errorsDictionary["CreditCard"] = (PageParams.ErrorId === 1); // 1 = auth_error
    errorsDictionary["PayPal"] = (PageParams.ErrorId === 2); // 2 = paypal error

    //Handle page mode
    if (PageParams.PageMode === 1) {
        //show only credit card option
        CCActivate(true, 0);
        PayPalActivate(false, 0, true);
    }
    else if (PageParams.PageMode === 2) {
        //show only paypal option
        PayPalActivate(true, 0);
        CCActivate(false, 0, true);
    }
    else { // all should display
        CCActivate(true, 0);
        PayPalActivate(false, 0, false);
    }

    //CC, Paypal and GPay toggle
    $(".credit-card").click(function () {
        CCActivate(true, 400);
        PayPalActivate(false, 400, false);
        GPayActivate(false, 400, false);

        dataLayerService.pushEvent("click_card_tab", {});
    });

    $(".paypal").click(function () {
        PayPalActivate(true, 400);
        CCActivate(false, 400, false);
        GPayActivate(false, 400, false);

        dataLayerService.pushEvent("click_paypal_tab", {});
    });

    $(".gpay").click(function () {
        GPayActivate(true, 400);
        CCActivate(false, 400, false);
        PayPalActivate(false, 400, false);

        dataLayerService.pushEvent("click_gpay_tab", {});
    });

    //Hide header if Native app
    if (PageParams.IsNative) {
        $("#logo").hide();
    }

    if (PageParams.ErrorId === 1 || PageParams.ErrorId === 2) {
        // 0 = no error
        // 1 = auth_error
        // 2 = paypal error
        Logger.Error({ message: "Recieved error from handler", memberId: PageParams.MemberId, errorId: PageParams.ErrorId });
    }

    //Show/ hide expert details
    if (PageParams.ExpertFriendlyName && PageParams.FeePerMinute) {
        $(".expert-name")[0].innerText = PageParams.ExpertFriendlyName;
        $("#expert-img")[0].src = 'https://expertsimages.kassrv.com/experts-pictures/big/pic' + PageParams.ExpertId + '.jpg';
    }
    else { $(".expert-wrap").hide(); }

    if (PageParams.SessionType === -1) {
        $("#boxDesktop").hide();
        //Hide sale box
        $("#sale-box-desktop").hide();
        $("#sale-mobile").hide();
        $(".free-minutes-badge").hide();
        $("#btnText").text("Continue");
    }
    else {
        if (PageParams.FreeMinutesIndication === 0 && !PageParams.SaleDescription) {
            //Hide sale box
            $("#sale-box-desktop").hide();
            $("#sale-mobile").hide();
            $(".free-minutes-badge").hide();
            $("#btnText").text("Continue");
        }
        else {
            //Set sale details
            if (PageParams.SaleDescription) {
                $('.sale-promotional-text').html(function (_) {
                    return PageParams.SaleDescription;
                });
            }
            else {
                $(".sale-desc").hide();
            }

            //hide 3FM indication
          if (PageParams.FreeMinutesIndication === 1) {
                $(".free-minutes").show();
                $(".free-minutes-badge").show();
                $("#btnText").text("Get my 3 Free minutes");
            }
            else if (PageParams.FreeMinutesIndication === 2) {
                //Presto free minutes
                $(".free-minutes").hide();
                $(".free-minutes-badge").show();
                $("#btnText").text("Continue");
            }
        }
    }
    LoadCountries();
    //QQP mode
    if (PageParams.QQPMode === 0) {
        // QQPMode = FullForm
        // Load coutries & states data for full form.
        LoadStates();
        CountriesStateBehavior();
    }
    else if (PageParams.QQPMode === 2) {
        // QQPMode = Short_plus3
        // Hide billing address fields except 3 fields.
        $('#billing-address-extra-fields').hide();
        // Load coutries data for short plus 3 field form.
    }
    else {
        // QQPMode = CreditCardNumber_Expiration_Cvv
        // Hide all billing address fields. 
        $('#billing-address-fields').hide();
    }

    //Iframe & Form configurations
    window.iFrameConfig = buildIframeConfig(PageParams);
    $("#iframeform").attr("action", formSubmitAction + location.search);
    FillDropDownExpirationYear();

    elements = {
        iframe: document.getElementById("tokenExIframe"),
        token: document.getElementById("token"),
        iframeData: document.getElementById("iframeData"),
        hmac: document.getElementById("hmac"),
        form: document.getElementById("iframeform"),
        btnSubmit: document.getElementById("btnSubmit"),
        btnSubmitPaypal: document.getElementById("btnSubmitPaypal")
    };

    elements.btnSubmit.onclick = function () {
        $(this).attr("disabled", true);

        if ($(".credit-card").is(":visible") && !$(".credit-card").hasClass("off")) {
            iframe.validate();
        }

        return false;
    }

    elements.btnSubmitPaypal.onclick = function () {
        $(this).attr("disabled", true);

        if ($(".paypal").is(":visible") && !$(".paypal").hasClass("off")) { // paypal

            var data = {
                "PayPal": {
                    "Amount": parseInt($('select[id=paypal-amount-select]')[0].value.replace("$", ""))
                }
            };
            elements.form.valid = true;

            submitForm(data, elements, "PayPal");
        }

        return false;
    }

    // TokenEx
    loadTokenExScript(PageParams.TokenExScriptUrl, initTokenExIframe);

    if (PageParams.GooglePayEnabled && PageParams.PageMode !== 2) {
        GPayActivate(true, 0, false);
        // GooglePay
        loadGooglePayScript(PageParams.GooglePayScriptUrl, onGooglePayLoaded);
    }
    else {
        GPayActivate(false, 0, true);
    }

    function CCActivate(isActiv, duration, hideCompletely) {
        if (isActiv) {
            $("#credit-card-fields").show(duration);
            $(".btn-wrap-cc").show();
            $(".credit-card").removeClass("off");
            $(".safe-secure-mobile-wrap").show(duration);
            handleErrorVisibility("CreditCard");
        }
        else {
            $("#credit-card-fields").hide(duration);
            $(".btn-wrap-cc").hide();
            if (hideCompletely) {
                $(".credit-card").hide(duration);
            }
            else {
                $(".credit-card").addClass("off");
            }
            $(".safe-secure-mobile-wrap").hide(duration);
        }
    }

    function PayPalActivate(isActiv, duration, hideCompletely) {
        if (isActiv) {
            $("#paypal-fields").show(duration);
            $(".btn-wrap-paypal").show();
            $(".paypal-footnote").show(duration);
            $(".paypal").removeClass("off");
            handleErrorVisibility("PayPal");
        }
        else {
            $("#paypal-fields").hide(duration);
            $(".btn-wrap-paypal").hide();
            $(".paypal-footnote").hide(duration);
            if (hideCompletely) {
                $(".paypal").hide(duration);
            }
            else {
                $(".paypal").addClass("off");
            }
        }
    }

    function GPayActivate(isActiv, duration, hideCompletely) {
        if (isActiv) {
            $("#gpay-fields").show(duration);
            $(".btn-wrap-gpay").show();
            $(".gpay").removeClass("off");
            handleErrorVisibility("GooglePay");
        }
        else {
            $("#gpay-fields").hide(duration);
            $(".btn-wrap-gpay").hide();
            if (hideCompletely) {
                $(".gpay").hide(duration);
            }
            else {
                $(".gpay").addClass("off");
            }
        }
    }

    function handleErrorVisibility(optionName) {
        if (errorsDictionary[optionName]) {
            $(".general-error").show();
        }
        else {
            $(".general-error").hide();
        }
    }

    function applyMobileStyles() {
        var responsiveMargin = "36px";
        if (window.innerWidth < 360) {
            responsiveMargin = "23px";
        }

        // make activation buttons adjustable for small screen width (e.g. iPhone 5/SE)
        $(".credit-card").css("margin-right", responsiveMargin);
        $(".paypal").css("margin-right", responsiveMargin);
        $(".gpay").css("margin-right", responsiveMargin);
    }

    function applyDesktopStyles() {
        $("div[class='box']").css("min-height", "300px"); // select div with box class only, align left white rectangle
        // sale part adjustment
        if (!(PageParams.SessionType === -1 || (PageParams.FreeMinutesIndication === 0 && !PageParams.SaleDescription))) {
            $(".kasamba #boxDesktop").css("height", "300px"); // align right white rectangle (for presto badges are hidden)
            if (PageParams.FreeMinutesIndication === 1 && !PageParams.SaleDescription) {
                $(".free-minutes").css("padding-top", "0px");
            }
        }
    }

    $(window).resize(function () {
        if (PageParams && PageParams.SiteId) {
            switch (PageParams.SiteId) {
                case 2: // presto web 
                    applyDesktopStyles();
                    break;

                case 5:
                case 6:
                case 7:
                case 8:
                case 9: // touch, native or tablet
                    applyMobileStyles();
                    break;

                default: //kasamba web or anything else
                    applyDesktopStyles();
                    break;
            }
        }
    });
});


//Force page reload in case of previous page was opened (Safari specific behavior, cached previous page)
$(window).bind("pageshow", function (event) {
    try {
        if (event.originalEvent.persisted) {
            window.location.reload();
        }
    }
    catch (e) {
        if (Logger) {
            Logger.Error({ message: "failed in pageshow event ", exception: e });
        }
    }
});


function initTokenExIframe() {
    $.ajax({
        url: casApiUrl + "/tokenex/authkey",
        xhrFields: {
            withCredentials: true
        },
        success: function (data) {
            createExTokenIframe(data.authKey, data.timestamp);
        },
        error: function (request, status, error) {
            // fallback in case CAS is unavailable, take data from cookies
            createExTokenIframe(PageParams.TokenExAuthenticationKey, PageParams.TokenExTimeStamp);
            Logger.Error({ message: "Failed to load TokenEx auth key", memberId: PageParams.MemberId, responseText: request.responseText, status: status, error: error });
        },
        complete: function (jqxhr, status) {
            setTimeout(function () {
                iframe.remove();
                initTokenExIframe();
            }, 19 * 60 * 1000);
        }
    });
}

function createExTokenIframe(authKey, timestamp) {
    iFrameConfig.timestamp = timestamp;
    iFrameConfig.authenticationKey = authKey;

    iframe = new TokenEx.Iframe("tokenExIframeDiv", iFrameConfig);

    iframe.on("load", function () {
        Logger.Info({ area: "TokenEx", message: "CC iFrame Loaded", memberId: PageParams.MemberId });
        $("#tx_iframe_tokenExIframeDiv").attr("scrolling", "no");
        $("#tx_iframe_cvv_mycvv").attr("scrolling", "no");
        $('body').css("opacity", "1");
    });

    iframe.on("validate", function (data) {
        if (data.validator && data.validator === "origin") {
            //bugfix
        }
        else {
            if (!data.isValid) {
                //CC not valid
                $("#credit-card-error").text("please enter a valid credit card");
                $("#credit-card-error").show();
            } else {
                $("#credit-card-error").hide();
            }

            if (!data.isCvvValid) {
                //CVV not valid
                $("#cvv-error").text("valid cvv needed");
                $("#cvv-error").show();

            } else {
                $("#cvv-error").hide();
            }

            if (!ValidateCardType(data.cardType)) {
                // card type is not supported
                return;
            }

            if (data.isValid && data.isCvvValid) {
                //CC flow
                if ($("#iframeform").valid()) {
                    iframe.tokenize();
                    Logger.Info({ area: "TokenEx", message: "Card Submit", memberId: PageParams.MemberId });
                }
            }
        }
    });

    iframe.on("cardTypeChange", function (data) {
        if (data && data.possibleCardType && data.possibleCardType != "unknown") {
            ValidateCardType(data.possibleCardType);
        }
    });

    iframe.on("tokenize", function (data) {
        if (data.token) {
            dataLayerService.pushEvent("token_success", {});
            Logger.Info({ area: "TokenEx", message: "TokenEx Tokenization successed", memberId: PageParams.MemberId });
        }

        //get token! message.data.token
        elements.token.value = data.token;
        data.bin = bin;
        elements.iframeData.value = JSON.stringify(data);
        elements.hmac.value = data.tokenHMAC;
        elements.cardIDType = GetCardType(data.cardType);
        data = BuildCreditCardData(elements);

        submitForm(data, elements, "CreditCard");
    });

    iframe.on("error", function (data) {
        $('body').css("opacity", "1");
        $("#SessionExpModal").modal('show');
        Logger.Error({ area: "TokenEx", message: "TokenEx iFrame error", memberId: PageParams.MemberId, iframeError: data });
        dataLayerService.pushEvent("token_fail", {});
    });

    iframe.load();
}

function FillDropDownExpirationYear() {
    var currentYear = new Date().getFullYear();

    for (var i = 1; i <= 11; i++) {
        $("select[id*=expiration-input-year]").append(

            $("<option></option>")
                .attr("value", currentYear - 2000)
                .text(currentYear)

        );
        currentYear++;
    }
}

function buildIframeConfig(pageParams) {
    var ccInputWidth = "335px";

    var inputTypeValue = "text";
    var cvvInputTypeValue = "text";

    if (isMobile) {
        ccInputWidth = "100%";
        inputTypeValue = "tel"; //"tel" means that numeric keyboard will be shown for mobile devices
        cvvInputTypeValue = "tel"; //"tel" means that numeric keyboard will be shown for mobile devices
    }

    iFrameConfig =
        {
            tokenExID: pageParams.TokenExId,
            tokenScheme: pageParams.TokenScheme,
            origin: pageParams.TokenExOrigin,
            styles:
            {
                base: "width:" + ccInputWidth + "; border-radius: 0; border:0;border-bottom: 1px solid #CECECE;font-size: 17px;line-height: 23px;text-indent: 2px;color:#000000;background: #ffffff; padding: 0;",
                focus: "border:0; border-bottom: 1px solid #CECECE; outline:none;",
                error: "border:0; border-bottom: 1px solid #fa0000; outline:none;",

                cvv: {
                    base: "height:23px; width:107px; border-radius: 0; border:0;border-bottom: 1px solid #CECECE;font-size: 17px;line-height: 23px;text-indent: 2px;color:#000000;background: #ffffff; padding: 0;",
                    focus: "border:0; border-bottom: 1px solid #CECECE; outline:none;",
                    error: "border:0; border-bottom: 1px solid #fa0000; outline:none;"
                }
            },
            pci: true,
            debug: false,
            cvv: true,
            cvvContainerID: "mycvv",
            placeholder: "XXXX-XXXX-XXXX-XXXX",
            cvvPlaceholder: "CVV",
            enableValidateOnBlur: false,
            inputType: inputTypeValue,
            cvvInputType: cvvInputTypeValue,
            enablePrettyFormat: true
        };

    return iFrameConfig;
}

function GetCardType(cardType) {
    var cardTypeLCase = cardType.toString().toLowerCase();

    switch (cardTypeLCase) {
        case "amex":
        case "americanexpress":
            return 1;
        case "diners":
            return 2;
        case "visa":
            return 3;
        case "mastercard":
            return 4;
        case "discover":
            return 5;
    }
    return 0;
}

function ValidateCardType(cardType) {
    if (supportedCards.indexOf(cardType) != -1) {
        $("#credit-card-error").hide();
        return true;
    }

    $("#credit-card-error").text("we accept Visa, MasterCard, American Express and Discover cards only");
    $("#credit-card-error").show();
    return false;
}

function GetPageParamsFromCookie() {
    var objJsonB64, cookieJson, pageParams;

    objJsonB64 = getCookie("QpPageParams");

    if (objJsonB64) {
        cookieJson = atob(objJsonB64);
        if (cookieJson) {
            pageParams = JSON.parse(cookieJson);

        }
        else {
            //Logger.Error({ message: "Decrypt Base64 cookie data failed" }, true, e);
            Logger.Error({ message: "Decrypt Base64 cookie data failed", memberId: getCookie("lvpcid") });
        }
    }
    else {
        Logger.Error({ message: "No Json cookie", memberId: getCookie("lvpcid") });
    }

    return pageParams;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function loadTokenExScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState) {  // only required for IE <9
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function () {
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

function LoadCountries() {
    $.ajax(
        {
            type: "GET",
            url: 'https://touch.kasamba.com/Touch.Services/Data/CountriesAndstates.svc/Countries',
            cache: true,
            dataType: "text",
            success: function (data) {
                var optionList = '';
                countriesData = eval(data);
                var CountriesSelect = $("select[id*=ddlCountry]");
                optionList = '<option value="">Select Country</option>';
                $.each(countriesData, function (key) {
                    optionList += '<option value="' + countriesData[key].ID + '">' + countriesData[key].Name + '</option>';
                });

                CountriesSelect.html(optionList);
            },
            error: function (request, status, error) {
                Logger.Error({ message: "Failed to load countries", memberId: PageParams.MemberId, responseText: request.responseText, status: status, error: error });
            }
        }
    );
}

var arrStates = [];
function LoadStates() {
    $.ajax(
        {
            type: "GET",
            url: 'https://touch.kasamba.com/Touch.Services/Data/CountriesAndstates.svc/States',
            cache: true,
            dataType: "text",
            success: function (data) {
                var StatesData = eval(data);
                arrStates = JSON.parse(data);
            },
            error: function (request, status, error) {
                Logger.Error({ message: "Failed to load states", memberId: PageParams.MemberId, responseText: request.responseText, status: status, error: error });
            }
        }
    );
}

function BuildStateSelect(CountryObj) {

    var DisplayStatesSelect = false;
    var StatesSelect = $("select[id*=ddlState]");
    var SelectedCountriyName = $(CountryObj).find('option:selected').text();
    var SelectedCountriyId = parseInt($(CountryObj).find('option:selected').val());
    var optionList = '';
    optionList = '<option value="">Select State</option>';
    for (i = 0; i < arrStates.length; i++) {
        if (arrStates[i].CountryID === SelectedCountriyId) {
            DisplayStatesSelect = true;
            optionList += '<option value="' + arrStates[i].ID + '">' + arrStates[i].Name + '</option>';
        }
    }

    if (DisplayStatesSelect) {
        StatesSelect.html(optionList);
        $('#divStateHolder').show();
    }
    else {
        $('select[id*=ddlState] option:gt(0)').remove();
        $('#divStateHolder').hide();
    }

}

function CountriesStateBehavior() {

    var CountriesSelect = $("select[id*=ddlCountry]");
    CountriesSelect.on('change', function (e) {

        var SelectedCountryValue = $(this).find('option:selected').text();
        var SelectedCountryID = $(this).find('option:selected').val();
        // $('div[id*=divErrState]').hide();
        BuildStateSelect(this);
    });


    var StateSelect = $("select[id*=ddlState]");
    StateSelect.on('change', function (e) {
        var SelectedStateValue = $("select[id*=ddlState] option:selected").text();
        var SelectedStateID = $('select[id*=ddlState] option:selected').val();
    });

}

//get countries: https://touch.kasamba.com/touch.services/data/CountriesAndStates.svc/Countries
// get states: https://touch.kasamba.com/touch.services/data/CountriesAndStates.svc/states

function BuildCreditCardData(elements) {

    //add and check validations
    if (elements.token.value && elements.hmac.value) {
        if (PageParams.QQPMode === 1) {
            //QQP mode
            return {
                "CreditCard": {
                    "Token": elements.token.value,
                    "HMAC": elements.hmac.value,
                    "ExpirationYear": parseInt($('select[id=expiration-input-year]')[0].value),
                    "ExpirationMonth": parseInt($('select[id=expiration-input-month]')[0].value),
                    "Type": elements.cardIDType,
                    "TokenType": 1 // TokenEx
                },
            };
        }
        else if (PageParams.QQPMode === 2) {
            return {
                "CreditCard": {
                    "Token": elements.token.value,
                    "HMAC": elements.hmac.value,
                    "ExpirationYear": parseInt($('select[id=expiration-input-year]')[0].value),
                    "ExpirationMonth": parseInt($('select[id=expiration-input-month]')[0].value),
                    "Type": elements.cardIDType,
                    "CardHolderFirstName": $('input[id=cardHolder]')[0].value.split(" ")[0],
                    "CardHolderLastName": $('input[id=cardHolder]')[0].value.split(" ")[1],
                    "CardHolderAddress": $('input[id=Street]')[0].value,
                    "CardHolderCountry": $("select[id*=ddlCountry]").find('option:selected').text(),
                    "CardHolderZip": $('input[id=zip-input]')[0].value.trim(),
                    "TokenType": 1 // TokenEx
                }
            };
        }
        else {
            return {
                "CreditCard": {
                    "Token": elements.token.value,
                    "HMAC": elements.hmac.value,
                    "ExpirationYear": parseInt($('select[id=expiration-input-year]')[0].value),
                    "ExpirationMonth": parseInt($('select[id=expiration-input-month]')[0].value),
                    "Type": elements.cardIDType,
                    "CardHolderFirstName": $('input[id=cardHolder]')[0].value.split(" ")[0],
                    "CardHolderLastName": $('input[id=cardHolder]')[0].value.split(" ")[1],
                    "CardHolderAddress": $('input[id=Street]')[0].value,
                    "CardHolderCity": $('input[id=city-input]')[0].value,
                    "CardHolderCountry": $("select[id*=ddlCountry]").find('option:selected').text(),
                    "CardHolderState": $("select[id*=ddlState]").find('option:selected').text(),
                    "CardHolderZip": $('input[id=zip-input]')[0].value.trim(),
                    "CardHolderPhone": $('input[id=phone]')[0].value,
                    "TokenType": 1 // TokenEx
                }
                //"ReCaptchaResponse": "string"
            };
        }
    }
}

function submitForm(data, elements, paymentType) {
    try {
        $('#loader').show();
        $("#btnSubmit").removeClass("active");
        $("#btnSubmitPaypal").removeClass("active");

        var events;
        if (isSubmitted === false) {
            if (paymentType === "CreditCard") {
                pushNativeEvent("billing_card_submit", "");
                dataLayerService.pushEvent("card_submit", {});
                events = generateTrackingEvents(
                    createCustomPageTestEvent("PaymentMethodCardSubmit1"),
                    createGooglePayEvent("CreditCardSubmitWITHOUTGoogle", "CreditCardSubmitWithGoogle"),
                    createQqpTestEvent(29, "QQPSubmit")
                );
            }
            else if (paymentType === "PayPal") {
                pushNativeEvent("billing_paypal_submit", "");
                dataLayerService.pushEvent("paypal_submit", { "desposit_amount": data.PayPal.Amount });
                events = generateTrackingEvents(
                    createCustomPageTestEvent("PaymentMethodPPSubmit1"),
                    createGooglePayEvent("PayPalSubmitWITHOUTGoogle", "PayPalSubmitWithGoogle")
                );
            }
            else if (paymentType === "GooglePay") {
                pushNativeEvent("billing_gpay_submit", "");
                dataLayerService.pushEvent("google_pay_submit", {});
                events = generateTrackingEvents(
                    createCustomPageTestEvent("PaymentMethodGPSubmit1")
                );
            }

            if (events) {
                Object.assign(data, events);
            }

            var objJsonStr = JSON.stringify(data);
            var objJsonB64 = btoa(objJsonStr);
            $("#qpData")[0].value = objJsonB64;

            elements.form.submit();
            isSubmitted = true;
        }
    }
    catch (e) {
        $('#loader').hide();
        Logger.Error({ message: "Encrypt form Data to Base64 and submit failed, encrypted data: " + data, memberId: memberId });
        isSubmitted = false;
    }
}

function buildTrackingPageLoadParams(pageParams) {
    var form_type;
    if (pageParams.PageMode === 2) {
        form_type = "paypal";
    }
    else if (pageParams.QQPMode === 0) {
        form_type = "full";
    }
    else if (pageParams.QQPMode === 2) {
        form_type = "short_plus3";
    }
    else {
        form_type = "short";
    }

    var error_message = pageParams.ErrorId === 0 ? "none" : "exists";

    var data = {
        "form_type": form_type,
        "error_message": error_message,
        "usertype": pageParams.UserType,
        "uid": pageParams.MemberId,
        "PrimaryEmail": pageParams.PrimaryEmail,
        "uaid": pageParams.Uaid,
        "siteid": pageParams.SiteId,
        "sale": pageParams.SaleDescription ? "true" : "false",
        "3fm_eligible": pageParams.FreeMinutesIndication === 1 ? "true" : "false",
        "SessionTimeStamp": pageParams.TokenExTimeStamp
    };

    return data;
}

var dataLayerService = {
    pushEvent: function (eventName, eventParams) {
        eventParams.event = eventName;
        dataLayer.push(eventParams);
    }
};

function pushNativeEvent(eventName, eventParams) {
    if (nativeEventsEnabled === true) {
        LP.helpers.nativeApi.tryPushEvent(eventName, eventParams);
    }
}

function createQqpTestEvent(eventType, eventName) {
    if (PageParams.InTest !== true) {
        return null;
    }

    var testGroup;
    if (PageParams.QQPMode === 2) {
        testGroup = "NameCountryZip";
    } else {
        testGroup = "Default";
    }

    var eventProperties = {
        "OperatingSystem": PageParams.OsType,
        "TestGroup": testGroup,
        "SiteID": PageParams.SiteId
    };

    return trackingEventsService.createTrackingRequestObj(eventType, eventName, eventProperties);
}

function createCustomPageTestEvent(eventName) {
    if (PageParams.InCustomPageTest) {
        return trackingEventsService.createTrackingRequestObj(35, eventName);
    }

    return null;
}

function createGooglePayEvent(eventName0, eventName1, properties) {
    if (PageParams.GooglePayInTest) {
        var convertedStatus = "converted";
        //newMemeber - typo handling from backend until fixed in backend
        if (PageParams.UserType === "newMember" || PageParams.UserType === "newMemeber") { //newMemeber - typo handling from backend until fixed in backend
            convertedStatus = "converted";
        }

        var eventName = eventName0;
        if (eventName1) {
            if (PageParams.GooglePayEnabled) {
                eventName = eventName1;
            }
        }

        var params = { ConvertedStatus: convertedStatus, UiStyle: "Old Style" }

        if (properties != null) {
            Object.assign(params, properties);
        }

        return trackingEventsService.createTrackingRequestObj(36, eventName, params);
    }

    return null;
}

function pushTrackingEvents() {
    var events = new Array();
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != null) {
            events.push(arguments[i]);
        }
    }

    if (events.length > 0) {
        trackingEventsService.trackEvents(events);
    }
}

function generateTrackingEvents() {
    try {
        var events = new Array();
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] != null) {
                events.push(arguments[i]);
            }
        }

        if (events.length > 0) {
            return { 'TrackingEvents': events };
        }
    } catch (e) {
        console.error(e);
    }
    return null;
}

function configureFormValidation() {

    //CardHolder name Validation function
    $.validator.addMethod('nameValid', function (value, element) {
        return new RegExp(/[a-zA-z]+\s[a-zA-z]/).test(value);
    }, 'please enter full name');

    //ZipCode Validation function
    $.validator.addMethod('zipValid', function (value, element) {
        var Country = $("select[id*=ddlCountry] option:selected").text();
        var zipCode = $('input[id*=zip-input]').val().trim();
        var regex;
        switch (Country) {
            case "United States of America":
                regex = /^\d{9}$|^\d{5}$|(^\d{5}-\d{4}$)|(^\d{5}[ ]\d{4}$)/g;
                break;
            case "Canada":
                regex = /^[A-z]{1}\d{1}[A-z]{1}([ ]|-)?\d{1}[A-z]{1}\d{1}$/g;
                break;
            case "United Kingdom":
                regex = /^.{0,5}([ ]|-)?\d{1}[A-z]{2}$/g;
                break;
            case "Australia":
                regex = /^\d{4}$/g;
                break;
            default:
                regex = /.*/g;
        }
        return zipCode.match(regex) === null || false ? false : true;
    }, 'please enter a valid zip code');

    //Exp date Validation function
    $.validator.addMethod('dateValid', function (value, element) {
        var selected_Month = $('select[id*=expiration-input-month] option:selected').val();
        var selected_Year = parseInt($('select[id*=expiration-input-year] option:selected').text());

        var selectedDate = new Date(selected_Year, selected_Month);
        var today = new Date();
        today = new Date(today.getFullYear(), today.getMonth() + 1);
        var isValid = true;
        isValid = (today < selectedDate && selected_Month !== "MM");
        //Fix to affect month input ui too
        if (!isValid) { $("#expiration-input-month").addClass("error"); }
        else { $("#expiration-input-month").removeClass("error"); }
        return isValid;



    }, 'please enter a valid expiration date');

    //Phone Validation function
    $.validator.addMethod('phoneValid', function (value, element) {
        var fullPhone = $('input[id*=phone]').val();
        var cleanedPhone = fullPhone.replace(/[^0-9]/gi, ''); // Replace everything that is not a number with nothing
        return cleanedPhone.length > 6
    }, 'please enter a valid phone number');

    //Char code validation function
    $.validator.addMethod("isLatin1", function (value) {
            for (var i = 0; i < value.length; i++) {
                if (value.charCodeAt(i) > 255) {
                    return false;
                }
            }
            return true;
        },
    "Field includes non-Latin characters");

    $("#expiration-input-month").blur(function () {
        $("#iframeform").validate().element("#expiration-input-year");
    })
    if (PageParams.QQPMode === 0) //fullform
    {
        $("#iframeform").validate({
            groups: {
                date: "year month"
            },
            rules: {
                ccyear: {
                    dateValid: true
                },
                month: {
                   dateValid: true
                },
                cardHolder: {
                    required: true,
                    nameValid: true,
                    isLatin1: true
                },
                ddlCountry: {
                    required: true,
                    isLatin1: true
                },
                ddlState: {
                    required: {
                        depends: function (elem) {
                            return $("#ddlCountry").val() > 0
                        }
                    },
                    isLatin1: true
                },
                city: {
                    required: true,
                    isLatin1: true
                },
                zip: {
                    required: true,
                    zipValid: true
                },
                street: {
                    required: true,
                    isLatin1: true
                },
                phone: {
                    required: true,
                    phoneValid: true
                },
                paypalAmount: {
                    required: true
                }
            },
            messages: {

                cardHolder: {
                    required: "Cardholder's Name is missing",
                    nameValid: "Enter name as it appears on the card",
                    isLatin1: "Name includes non-Latin characters"
                },
                ddlCountry: {
                    required: "Select a country",
                    isLatin1: "Country includes non-Latin characters"
                },
                ddlState: {
                    required: "Select a state",
                    isLatin1: "State includes non-Latin characters"
                },
                city: {
                    required: "City is missing",
                    isLatin1: "City includes non-Latin characters"
                },
                zip: {
                    required: "Zip code is missing",
                    zipValid: "Zip code is invalid"
                },
                street: {
                    required: "Street is missing",
                    isLatin1: "Street includes non-Latin characters"
                },
                phone: {
                    required: "Phone is missing",
                    phoneValid: "Please enter a valid phone number"
                },
                paypalAmount: {
                    required: "Amount is missing"
                }
            }
        });

    }
    else if (PageParams.QQPMode === 2) // QQP short_plus3
    {
        $("#iframeform").validate({
            groups: {
                date: "year month"
            },
            rules: {
                ccyear: {
                    dateValid: true
                },
                month: {
                   dateValid: true
                },
                cardHolder: {
                    required: true,
                    nameValid: true,
                    isLatin1: true
                },
                ddlCountry: {
                    required: true,
                    isLatin1: true
                },
                //ddlState: {
                //    required: {
                //        depends: function (elem) {
                //            return $("#ddlCountry").val() > 0
                //        }
                //    }
                //},
                //city: {
                //    required: true
                //},
                zip: {
                    required: true,
                    zipValid: true
                },
                //street: {
                //    required: true
                //},
                //phone: {
                //    required: true,
                //    phoneValid: true
                //},
                //paypalAmount: {
                //    required: true
                //}
            },
            messages: {

                cardHolder: {
                    required: "Cardholder's Name is missing",
                    nameValid: "Enter name as it appears on the card",
                    isLatin1: "Name includes non-Latin characters"
                },
                ddlCountry: {
                    required: "Select a country",
                    isLatin1: "Country includes non-Latin characters"
                },
                //ddlState: {
                //    required: "Select a state"
                //},
                //city: {
                //    required: "City is missing"
                //},
                zip: {
                    required: "Zip code is missing",
                    zipValid: "Zip code is invalid"
                },
                //street: {
                //    required: "Street is missing"
                //},
                //phone: {
                //    required: "Phone is missing",
                //    phoneValid: "Please enter a valid phone number"
                //},
                //paypalAmount: {
                //    required: "Amount is missing"
                //}
            }
        });
    }
    else { // QQP short
        $("#iframeform").validate({

            rules: {
                ccyear: {
                    dateValid: true
                },
                //month: {
                //    dateValid: true
                //}
            }
        });
    }
}

function goBack() {
    if (PageParams.IsNative) {
        window.location = "https://touch.kasamba.com/pages/native/NativeEvent.aspx?event=CloseWithError";
    }
    else {
        history.back();
    }
}

function LoadPaypalAmounts() {

    var selected = 50;
    payPalAmounts = [25, 50, 100, 150, 200, 250, 500];

    try {

        if (PageParams.FeePerMinute) {
            var minFee = PageParams.FeePerMinute * 2;
            payPalAmounts = payPalAmounts.filter(function (value, index, arr) {
                return value > minFee;
            });
            if (minFee > selected) {
                selected = payPalAmounts[0];
            }

        }
    } catch (e) {
        Logger.Error({ message: "LoadPaypalAmounts failed: " + e, memberId: memberId });
    }
    finally {
        fillPaypalSelect(payPalAmounts, selected);
    }
}

function fillPaypalSelect(payPalAmounts, selected) {
    var PaypalSelect = $("select[id*=paypal-amount-select]");
    var optionList = '';

    $.each(payPalAmounts, function (key) {
        if (payPalAmounts[key] === selected) {
            optionList += '<option value="' + payPalAmounts[key] + '" selected="selected">' + "$" + payPalAmounts[key] + ".00" + '</option>';
        }
        else
            optionList += '<option value="' + payPalAmounts[key] + '" ">' + "$" + payPalAmounts[key] + ".00" + '</option>';
    });

    PaypalSelect.html(optionList);
}

function NativeEventsSupported() {
    try {
        if (!PageParams.IsNative) {
            return false;
        }

        var urlParams = new URLSearchParams(window.location.search);
        var param = urlParams.get("showPaypal");
        // Don't push native js event when showPaypal==true. Requested by Android devs
        if (param && param.toLowerCase() === "true") {
            return false;
        }
    }
    catch (e) {
        if (Logger) {
            Logger.Error({ message: "Error occured in NativeEventsSupported method ", exception: e });
        }
    }

    return true;
}

/****************************************** Google Pay logic ******************************************/

function loadGooglePayScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    if (script.readyState) {  // only required for IE <9
        script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function () {
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

// Defined version of the Google Pay API referenced with our configuration
var baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
};

var allowedCardAuthMethods = ["PAN_ONLY"]; // @todo do we need "CRYPTOGRAM_3DS" option also?
var allowedCardNetworks = ["AMEX", "DISCOVER", "MASTERCARD", "VISA"];

// Describes our site's support for the CARD payment method and its required fields
var baseCardPaymentMethod = {
    type: "CARD",
    parameters: {
        allowedAuthMethods: allowedCardAuthMethods,
        allowedCardNetworks: allowedCardNetworks,
        allowPrepaidCards: true,
        allowCreditCards: true,
        billingAddressRequired: false,
        billingAddressParameters: { format: "FULL", phoneNumberRequired:false}
    }
}

// Identifies gateway and site's gateway merchant identifier
function getGoogleTokenizationSpecification() {
    var tokenizationSpecification = {
        type: 'PAYMENT_GATEWAY',
        parameters: {
            "gateway": PageParams.GooglePayGateway,
            "vantiv:merchantPayPageId": PageParams.GooglePayMerchantPayPageId,
            "vantiv:merchantOrderId": PageParams.GooglePayMerchantOrderId,
            "vantiv:merchantTransactionId": PageParams.GooglePayMerchantTransactionId,
            "vantiv:merchantReportGroup": PageParams.GooglePayMerchantReportGroup
        }
    };

    return tokenizationSpecification;
}

function getGoogleCardPaymentMethod() {
    return Object.assign({},
        baseCardPaymentMethod,
        { tokenizationSpecification: getGoogleTokenizationSpecification() }
    );
}

var paymentsClient = null;

// Configure support for payment methods supported by the Google Pay API.
function getGoogleIsReadyToPayRequest() {
    return Object.assign({},
        baseRequest,
        { allowedPaymentMethods: [baseCardPaymentMethod] }
    );
}

// Provide Google Pay API with a payment amount, currency, and amount status
function getGoogleTransactionInfo() {
    return {
        countryCode: 'US',
        currencyCode: 'USD',
        totalPriceStatus: 'FINAL',
        // set to cart total
        totalPrice: '500.00'
    };
}

// Configure support for the Google Pay API
function getGooglePaymentDataRequest() {
    var paymentDataRequest = Object.assign({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [getGoogleCardPaymentMethod()];
    paymentDataRequest.transactionInfo = getGoogleTransactionInfo();
    paymentDataRequest.merchantInfo = {
        merchantId: PageParams.GooglePayMerchantId,
        merchantName: PageParams.GooglePayMerchantName
    };
    return paymentDataRequest;
}

// Return an active PaymentsClient or initialize
function getGooglePaymentsClient() {
    if (paymentsClient === null) {
        paymentsClient = new google.payments.api.PaymentsClient({ environment: "TEST" }); // can be "TEST" or "PRODUCTION"
    }
    return paymentsClient;
}

// Add a Google Pay purchase button alongside an existing checkout button
function addGooglePayButton() {
    var paymentsClient = getGooglePaymentsClient();
    var button = paymentsClient.createButton({
        onClick: onGooglePaymentButtonClicked,
        buttonColor: "black",
        buttonType: "short"
    });
    document.getElementsByClassName("btn-wrap-gpay")[0].appendChild(button);
}

// Prefetch payment data to improve performance
function prefetchGooglePaymentData() {
    var paymentDataRequest = getGooglePaymentDataRequest();
    // transactionInfo must be set but does not affect cache
    paymentDataRequest.transactionInfo = {
        currencyCode: "USD",
        totalPriceStatus: "NOT_CURRENTLY_KNOWN"
    };

    var paymentsClient = getGooglePaymentsClient();
    paymentsClient.prefetchPaymentData(paymentDataRequest);
}

// Initialize Google PaymentsClient after Google-hosted JavaScript has loaded
// Display a Google Pay payment button after confirmation of the viewer's ability to pay.
function onGooglePayLoaded() {
    var paymentsClient = getGooglePaymentsClient();
    paymentsClient.isReadyToPay(getGoogleIsReadyToPayRequest())
        .then(function (response) {
            if (response.result) {
                addGooglePayButton();
                // this is to improve performance after confirming site functionality
                prefetchGooglePaymentData();
            }
        }).catch(function (e) {
            console.error(e);

            if (Logger) {
                Logger.Error({ message: "Error occured in onGooglePayLoaded method ", exception: e });
            }
        });
}

// Show Google Pay payment sheet when Google Pay payment button is clicked
function onGooglePaymentButtonClicked() {
    pushTrackingEvents(createGooglePayEvent("GooglePayChosen"));

    var paymentDataRequest = getGooglePaymentDataRequest();
    paymentDataRequest.transactionInfo = getGoogleTransactionInfo();

    var paymentsClient = getGooglePaymentsClient();
    paymentsClient.loadPaymentData(paymentDataRequest)
        .then(function (paymentData) {
            // handle the response
            processPayment(paymentData);
        }, function (rejectData) {
            var rejectReason = "";
            if (rejectData) {
                rejectReason = rejectData.statusCode;
            }
            dataLayerService.pushEvent("GooglePayReject", { "google_status_code": rejectReason });
            pushTrackingEvents(createGooglePayEvent("GooglePayReject", "GooglePayReject", { "google_status_code": rejectReason }));
            if (Logger) {
                Logger.Error({ message: "Google Pay - client wallet rejected. Rejection status code: " + rejectReason });
            }
        }).catch(function (e) {
            console.error(e);

            if (Logger) {
                Logger.Error({ message: "Error occured in onGooglePaymentButtonClicked method ", exception: e });
            }
        });
}

// Process payment data returned by the Google Pay API
function processPayment(paymentData) {
    var countryNameFromGoogle = "";
    try {
        countryNameFromGoogle = countriesData.filter(function (c) {
            return c.ShortCode === paymentData.paymentMethodData.info.billingAddress.countryCode.toLowerCase()})[0].Name;
    } catch (error) {
        console.error(error);

        if (Logger) {
            Logger.Error({ message: "Getting google pay cc country", exception: error });
        }
    }

    var data = {
        "CreditCard": {
            "Token": paymentData.paymentMethodData.tokenizationData.token,
            "Type": GetCardType(paymentData.paymentMethodData.info.cardNetwork),
            "LastDigits": paymentData.paymentMethodData.info.cardDetails,
            "TokenType": 2, // GooglePay
            "CardHolderFirstName": typeof paymentData.paymentMethodData.info.billingAddress !== "undefined" ? paymentData.paymentMethodData.info.billingAddress.name.split(" ")[0] : "",
            "CardHolderLastName": typeof paymentData.paymentMethodData.info.billingAddress !== "undefined" ? paymentData.paymentMethodData.info.billingAddress.name.split(" ")[1] : "",
            "CardHolderAddress": typeof paymentData.paymentMethodData.info.billingAddress !== "undefined" ? paymentData.paymentMethodData.info.billingAddress.address1 : "",
            "CardHolderCity": typeof paymentData.paymentMethodData.info.billingAddress !== "undefined" ? paymentData.paymentMethodData.info.billingAddress.locality : "",
            "CardHolderCountry": countryNameFromGoogle,
            "CardHolderState": typeof paymentData.paymentMethodData.info.billingAddress !== "undefined" ? paymentData.paymentMethodData.info.billingAddress.administrativeArea : "",
            "CardHolderZip": typeof paymentData.paymentMethodData.info.billingAddress !== "undefined" ? paymentData.paymentMethodData.info.billingAddress.postalCode : "",
            "CardHolderPhone": typeof paymentData.paymentMethodData.info.billingAddress !== "undefined" ? paymentData.paymentMethodData.info.billingAddress.phoneNumber : ""
        },
        "GooglePay": {
            "OrderId": PageParams.GooglePayMerchantOrderId,
            "ReportGroup": PageParams.GooglePayMerchantReportGroup
        }
    };

    elements.form.valid = true;

    submitForm(data, elements, "GooglePay");
}
