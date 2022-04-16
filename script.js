/* 클립보드 복사 이벤트 */
$(document).ready(function() {
    $("#tagTitle").click(function() {
        var copyTxt = document.getElementById('tagsBox').innerText;
        //input 태그에서만 작동하는 select 메소드를 이용하기 위해 teaxarea 엘리먼트 생성
        const textarea = document.createElement('textarea');
        textarea.textContent = copyTxt;
        document.body.append(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        alert('클립보드에 복사 되었습니다.');
    });
});

/* 구글 스프레드시트 스크립트 시작 */
var jsonp = function (url) {
    var script = window.document.createElement('script');
    script.async = true;
    script.src = url;
    script.onerror = function () {
        alert('구글 스프레드 시트 파일에 접근할 수 없습니다.')
    };
    var done = false;
    script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')) {
            done = true;
            script.onload = script.onreadystatechange = null;
            if (script.parentNode) {
                return script.parentNode.removeChild(script);
            }
        }
    };
    window.document.getElementsByTagName('head')[0].appendChild(script);
};

//스프레드 시트에서 받아 온 데이터 파싱
var parse = function (data) {
    var column_length = data.table.cols.length;
    if (!column_length || !data.table.rows.length) {
        return false;
    }
    var columns = [],
        result = [], 
        row_length,
        value;

    //cols의 label이 빈 값이므로 row의 첫번째 행을 column으로 지정
    for (var column_idx in data.table.cols) {
        columns.push(data.table.rows[0]['c'][column_idx].v);
    }
    //row 데이터 불러오기
    for (var rows_idx in data.table.rows) {
        row_length = data.table.rows[rows_idx]['c'].length;
        if (column_length != row_length) {
            return false;
        }
        for (var row_idx in data.table.rows[rows_idx]['c']) {
            if (!result[rows_idx]) {
                result[rows_idx] = {};
            }

            if(data.table.rows[rows_idx]['c'][row_idx] != null && data.table.rows[rows_idx]['c'][row_idx].v) {
                value = data.table.rows[rows_idx]['c'][row_idx].v;
            }
            else {
                value = "";
            }

            result[rows_idx][columns[row_idx]] = value;
        }
    }
    return result;
};

var query = function (sql, callback) {
    var url = 'https://spreadsheets.google.com/a/google.com/tq?',
        params = {
            key: '158vocAInLGsjTMCnGijI5aGy10kBz1roQvT-Y8pKJp8',
            tq: encodeURIComponent(sql),
            tqx: 'responseHandler:' + callback
        },
        qs = [];
    for (var key in params) {
        qs.push(key + '=' + params[key]);
    }
    url += qs.join('&');
    return jsonp(url); // JSONP 도우미 호출
}

var my_callback = function (data) {
    data = parse(data); // 데이터 parse
    //불러온 데이터 조작
    for (var i = 0; i < datas.length; i++) {
        if (JSON.stringify(datas[i]) == JSON.stringify(data)) {
            return false;
        }
    }
    datas.push(data);

    // HTML 헤더의 값을 추출
    var col = [];
    for (var i = 0; i < data.length; i++) {
        for (var key in data[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }
    // 받아 온 데이터 커스텀 
    var table = document.querySelector("#tagTable table");
    if (table === null || table == undefined) {
        // 동적 테이블 생성
        table = document.createElement("table");

        // HTML 테이블 헤더 생성
        var tr = table.insertRow(-1);
        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");
            th.innerHTML = col[i];
            tr.appendChild(th);
        }
        // HTML 테이블 ROW 생성
        for (var i = 1; i < data.length; i++) {
            tr = table.insertRow(-1);
            for (var j = 0; j < col.length; j++) {
                var text = data[i][col[j]];
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = data[i][col[j]];
                var text = data[i][col[j]];
                //tabCell.click
                tabCell.innerHTML = '<span class="select-data input-tag" data-tag="' + text + '">' + text + '</span>';
                tabCell.setAttribute("onclick","setDataToTag('" + text + "');");
                //tabCell.innerHTML = '<span class="select-data input-tag" data-tag="' + text + '" onclick="setDataToTag(\'' + text +'\')">' + text + '</span>';
            }
        }
        // 마지막으로 JSON 데이터로 새로 만든 테이블을 컨테이너에 추가
        var divContainer = document.getElementById("tagTable");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);
        $("#tagTable tr td").each(function(i, elem) {
            if($(this).find(".select-data").text() != "") {
                $(this).addClass("select-tag");
            }
        });
    } else {
        // 테이블 행 동적 추가
        for (var i = 1; i < data.length; i++) {
            var tr = table.insertRow();
            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = data[i][col[j]];
            }
        }
    }

}
var datas = [];
query('select *', 'my_callback');
/* 구글 스프레드시트 스크립트 끝 */

/* 태그 추가 스크립트 시작 */
$(function () {
    /* 태그 함수 */
    var // 태그 변수
        wrapperTags = $('.tags .wrapper-tags'),
        viewTags = $('.tags .wrapper-tags .view-tags'),
        inputTag = $('.tags .wrapper-tags .input-tag'),
        btnAddTags = $('.tags .add-tags'),
        alertErrorInAdd = $('.show-all-tags .alert-danger'),
        showTagsWhenResult = $('.show-all-tags .show-tags'),
        showCountCharactersTag = $('.tags .show-count-all .count-character-tag'),
        maxCharactersLengthTag = 20,

        tags = []; //추가한 태그 배열
        clickAddTag = (textTag) => {
            tags.push(textTag);
            var newTag = '<span class="tag" data-tag="' + textTag + '">' + textTag + '<i class="fa fa-close"></i></span>';
            inputTag.before(newTag);
        }
        addTag = (textTag) => {
            var newTag = '<span class="tag" data-tag="' + textTag + '">' + textTag + '<i class="fa fa-close"></i></span>';
            inputTag.before(newTag);
        },
        removeTag = function (textTag, animateRemove = 'hard') {
            var indexTag = tags.indexOf(textTag);
            tags.splice(indexTag, 1);
            if (animateRemove === 'hard') {
                viewTags.find('.tag[data-tag="' + textTag + '"]').remove();
                inputTag.focus();
            } else if ('slideLeft') {
                viewTags.find('.tag[data-tag="' + textTag + '"]').animate({
                    'width': 0,
                    'padding': 0,
                    'margin': 0
                }, 300, function () {
                    $(this).remove();
                    inputTag.focus();
                });
            }
        };

    showCountCharactersTag.find('span').html(maxCharactersLengthTag);
    
    /* 태그 추가 시작 */
    var hiddenDiv = $('.hiddendiv').first();  //css 파일에 display:none 처리 된 요소
    if (!hiddenDiv.length) {
        hiddenDiv = $('<div class="hiddendiv"></div>');
        $('body').prepend(hiddenDiv);
    }

    function autoWidth(myInput) {
        var fontFamily = myInput.css('font-family'),
            fontSize = myInput.css('font-size');

        if (fontSize) { hiddenDiv.css('font-size', fontSize); }
        if (fontFamily) { hiddenDiv.css('font-family', fontFamily); }

        hiddenDiv.text(myInput.val().trim());
        myInput.width(hiddenDiv.width());
    }
    /* 태그 추가 끝 */

    /* 에러 메세지 표시 */
    var loopShowError = true;
    function showError(type) {
        var duration = 3000;
        if (loopShowError === true) {
            $('.tags .show-error' + '.' + type).slideDown(200).delay(duration).slideUp(200);
            loopShowError = false;
            setTimeout(() => {
                loopShowError = true;
            }, duration);
        }
    }

    /* 트리거 함수 */
    inputTag.each(function () {
        autoWidth($(this));
    });

    // 태그 지우기
    inputTag.on('input', function () {
        autoWidth($(this));
        $(this).val($(this).val().trim().replace(/\s|,/, ''));
        var value = $(this).val(),
            diffrentChars = maxCharactersLengthTag - value.length;
        // show count characters left
        if (diffrentChars > 0) {
            showCountCharactersTag.find('span').html(diffrentChars);
        } else {
            showCountCharactersTag.find('span').html(0);
        }

        if (value.length > maxCharactersLengthTag) {
            showCountCharactersTag.addClass('max');
        } else {
            showCountCharactersTag.removeClass('max');
        }
    });

    var numRepaierRemoveTag = 1;
    inputTag.on('keydown', function (e) { numRepaierRemoveTag = $(this).val() == '' ? 0 : 1; });

    // 태그 추가
    inputTag.on('keyup', function (e) {
        var key = e.keyCode || e.which,
            currentVal = $(this).val().trim().replace(/\s|,/, ''),
            condationKey = key === 32 || key === 13 || key === 188,
            patternTag = /^[A-Za-z0-9ء-ي_]+$/g,
            x = 1;
        $(this).val(currentVal);

        if (currentVal.charCodeAt(0) > 1500) {
            condationKey = key === 32 || key === 13;
        } else {
            condationKey = key === 32 || key === 13 || key === 188;
        }

        /* 태그 추가 */
        // 엔터, 스페이스, 콤마를 통해 태그 생성
        if (condationKey) {
            if (currentVal == '') {
            } else if (/^_/.test(currentVal)) {
                showError('startChar');
            } 
            else if (currentVal.length > maxCharactersLengthTag) {
                showError('length');
            } else {
                if (currentVal.charAt(currentVal.length - 1) == '_') {
                    currentVal = currentVal.replace(currentVal.charAt(currentVal.length - 1), '');
                }
                if (tags.indexOf(currentVal) != -1) {
                    showError('already');
                } else {
                    $('.tags .show-error').css('display', 'none');
                    tags.push(currentVal);
                    inputTag.val('');
                    addTag(currentVal);
                    showCountCharactersTag.find('span').html(maxCharactersLengthTag);
                }
            }
            // 백스페이스 키로 태그 지우기
        } else if (key === 8 || key === 46) {
            if (numRepaierRemoveTag === 0) {
                var lastTag = tags[tags.length - 1];
                removeTag(lastTag);
                inputTag.val(lastTag);
            }
        }
    });

    // x 버튼을 눌러 태그 지우기
    viewTags.on('click', '.tag i', function (e) {
        var textTag = $(this).parent().attr('data-tag');
        removeTag(textTag, 'slideLeft');
    });

    // wrapper 태그에서 원하는 항목을 클릭할 때마다 focus 추가?
    inputTag.focus();
    wrapperTags.on('click', function () {
        inputTag.focus();
    });
    viewTags.on('click', '.tag', function (e) {
        e.stopPropagation();
    });
    inputTag.focus(function () {
        wrapperTags.addClass('focus');
        alertErrorInAdd.slideUp(200);
    }).blur(function () {
        wrapperTags.removeClass('focus');
    });

    // 태그 생성
    var showAllTags = (val, i, dataLayer) => {
        if(dataLayer == 'layer1') {
            return "#" + val + " ";
        }
        else if (dataLayer == 'layer2') {
            return  val + ", " ;
        }
        else if (dataLayer == 'layer3') 
        {
            return "#" + val + ", ";
        }
    };
    btnAddTags.on('click', function () {
        //선택된 태그가 없을 때
        if (!tags.length) {
            // 에러 메세지 보여줌
            alertErrorInAdd.slideDown(200);
            showTagsWhenResult.fadeOut(10);
        } else {
            var AllTagsInArray = '';
            tags.forEach((val, i) => {
                var dataLayer = $(this).data('layer');
                AllTagsInArray += showAllTags(val, i, dataLayer);
            });
            //마지막 쉼표를 제거하는 정규식 사용
            showTagsWhenResult.find('.tags').html("<span class='value'>" + AllTagsInArray.replace(/,\s*$/, "") + "</span>");
            alertErrorInAdd.slideUp(200);
            showTagsWhenResult.fadeIn(500);
        }
    });
    showTagsWhenResult.find('.wrapper-view-tags .hide-array').on('click', function () {
        showTagsWhenResult.fadeOut(250);
    });
});

function setDataToTag (data) {
    clickAddTag(data);
}
/* 태그 추가 스크립트 끝 */