var swiper = new Swiper('.swiper', {
    loop: true,
    navigation: {
        nextEl: '.reviews-next',
        prevEl: '.reviews-prev',
    },
})

//faq
$('.faq__link').click(function () {
    $(this).next().slideToggle(300)
})
//openMap
$('.openMap').click(function () {
    $('#modalMap').modal({
        fadeDuration: 300,
    })
    return false
})
