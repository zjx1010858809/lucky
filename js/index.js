
(function () {
    var choosed = JSON.parse(localStorage.getItem('choosed')) || {};
    console.log(choosed);
    var member = JSON.parse(localStorage.getItem('users')) || {};
    console.log(member);

    var speed = function () {
        return [0.1 * Math.random() + 0.01, -(0.1 * Math.random() + 0.01)];
    };
    var getKey = function (item) {
        return item.name + '-' + item.phone;
    };
    var createHTML = function () {
        var html = ['<ul>'];
        member.forEach(function (item, index) {
            item.index = index;
            var key = getKey(item);
            var color = choosed[key] ? 'yellow' : 'white';
            html.push('<li><a href="#" style="color: ' + color + ';">' + item.name + '</a></li>');
        });
        html.push('</ul>');
        return html.join('');
    };
    var lottery = function (count) {
        var list = canvas.getElementsByTagName('a');
        var color = 'yellow';
        var ret = member
            .filter(function (m, index) {
                m.index = index;
                return !choosed[getKey(m)];
            })
            .map(function (m) {
                return Object.assign({
                    score: Math.random()
                }, m);
            })
            .sort(function (a, b) {
                return a.score - b.score;
            })
            .slice(0, count)
            .map(function (m) {
                choosed[getKey(m)] = 1;
                list[m.index].style.color = color;
                return m.name + '<br/>' + m.phone;
            });
        localStorage.setItem('choosed', JSON.stringify(choosed));
        return ret;
    };
    var canvas = document.createElement('canvas');
    canvas.id = 'myCanvas';
    canvas.width = document.body.offsetWidth;
    canvas.height = document.body.offsetHeight;
    document.getElementById('main').appendChild(canvas);
    new Vue({
        el: '#app',
        template: `
            <div id="tools" class="tools">
            <button class="pure-button" @click="toggle" :class="{'button-secondary': !running,
            'button-success': running}">{{running?'??????':'??????'}}</button>
            <button v-for="value in btns" @click="onClick(value)" class="pure-button"
            :class="{ 'button-error': selected == value}">{{value}}</button>
          
          <button class="pure-button button-warning" @click="reset">??????</button>
          
          <!-- ?????????????????? -->
          
            <a-upload :disabled="isLoading" accept=".xlsx,.xls,.csv" :fileList="[]" :beforeUpload="beforeUpload"
                :customRequest="customRequest">
                <a-button class="pure-button button-warning" :loading="isLoading" title="??????.xlsx,.xls,.csv??????????????????">
                    {{ isImportUsers ? '????????????' : '????????????' }}
                    <a-icon v-if="isImportUsers" class="operation-success-icon" type="check-circle" />
                </a-button>
            </a-upload>
          </div>
          
          `,
        data() {
            return {
                selected: 10,
                running: false,
                // ????????????
                isLoading: false,
                // ????????????
                users: [],
                // ???????????????????????????
                isImportUsers: false,
                // ??????????????????????????????
                isImportMode: false,
                btns: [
                    30, 10, 5, 2, 1
                ]
            }
        },
        mounted() {
            canvas.innerHTML = createHTML();
            TagCanvas.Start('myCanvas', '', {
                textColour: null,
                initial: speed(),
                dragControl: 1,
                textHeight: 14
            });
        },
        methods: {
            reset: function () {
                if (confirm('???????????????????????????????????????????????????????????????')) {
                    //localStorage.clear();
                    localStorage.removeItem("choosed");
                    location.reload(true);
                }
            },
            // ??????????????????
            beforeUpload(file, fileList) {
                return true
            },
            // ?????????????????????
            customRequest(data) {
                // ????????????
                this.users = []
                // ????????????
                this.isLoading = true
                // ??????????????????
                formJson(data.file, (code, sheets) => {
                    // ????????????????????????
                    if (code === 0) {
                        // ????????????
                        sheets.forEach(sheet => {
                            // ?????? sheet
                            sheet.list.forEach(row => {
                                // ??????
                                switch(row.length){
                                    case 0:
                                        break;
                                    case 1:
                                        const user1 = this.userJson(row[0],"")
                                        this.users.push(user1) 
                                        break;
                                    default:
                                        const user2 = this.userJson(row[0],row[1])
                                        this.users.push(user2) 
                                        break;
                                }
                            })
                        })
                        // ????????? JSON ?????????
                        member = JSON.stringify(this.users)
                        // ????????? localStorage
                        localStorage.setItem('users', member)
                        // ??????????????????
                        this.isImportUsers = this.users.length
                        // ??????????????????
                        if (this.users.length) {
                            // ????????????
                            this.$message.success('??????????????????')
                            location.reload(true);
                        } else {
                            // ????????????
                            this.$message.error('????????????????????????????????????')
                        }
                        // ????????????
                        this.isLoading = false
                    } else {
                        // ????????????
                        this.isLoading = false
                        this.$message.success('??????????????????')
                    }
                })
            },

            // ????????????????????????????????????????????????
            userJson(item1,item2) {

                // ?????????2?????????
                return {
                    id: this.users.length,
                    name: item1,
                    phone: item2
                }
                
    
            },

            onClick: function (num) {
                $('#result').css('display', 'none');
                $('#main').removeClass('mask');
                this.selected = num;
            },
            toggle: function () {
                if (this.running) {
                    TagCanvas.SetSpeed('myCanvas', speed());
                    var ret = lottery(this.selected);
                    if (ret.length === 0) {
                        $('#result').css('display', 'block').html('<span>?????????</span>');
                        return
                    }
                    $('#result').css('display', 'block').html('<span>' + ret.join('</span><span>') + '</span>');
                    TagCanvas.Reload('myCanvas');
                    setTimeout(function () {
                        localStorage.setItem(new Date().toString(), JSON.stringify(ret));
                        $('#main').addClass('mask');
                    }, 300);
                } else {
                    $('#result').css('display', 'none');
                    $('#main').removeClass('mask');
                    TagCanvas.SetSpeed('myCanvas', [5, 1]);
                }
                this.running = !this.running;
            }
        }
    });


})();


