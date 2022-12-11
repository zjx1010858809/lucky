
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
            'button-success': running}">{{running?'暂停':'开始'}}</button>
            <button v-for="value in btns" @click="onClick(value)" class="pure-button"
            :class="{ 'button-error': selected == value}">{{value}}</button>
          
          <button class="pure-button button-warning" @click="reset">重置</button>
          
          <!-- 上传抽签清单 -->
          
            <a-upload :disabled="isLoading" accept=".xlsx,.xls,.csv" :fileList="[]" :beforeUpload="beforeUpload"
                :customRequest="customRequest">
                <a-button class="pure-button button-warning" :loading="isLoading" title="支持.xlsx,.xls,.csv格式的文件。">
                    {{ isImportUsers ? '更新清单' : '上传清单' }}
                    <a-icon v-if="isImportUsers" class="operation-success-icon" type="check-circle" />
                </a-button>
            </a-upload>
          </div>
          
          `,
        data() {
            return {
                selected: 10,
                running: false,
                // 上传状态
                isLoading: false,
                // 用户列表
                users: [],
                // 是否导入了用户列表
                isImportUsers: false,
                // 是否有自定义奖项配置
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
                if (confirm('确定要重置么？所有之前的抽奖历史将被清除！')) {
                    //localStorage.clear();
                    localStorage.removeItem("choosed");
                    location.reload(true);
                }
            },
            // 上传之前检查
            beforeUpload(file, fileList) {
                return true
            },
            // 自定义上传清单
            customRequest(data) {
                // 数据记录
                this.users = []
                // 进入加载
                this.isLoading = true
                // 开始解析数据
                formJson(data.file, (code, sheets) => {
                    // 解析成功且有数据
                    if (code === 0) {
                        // 解析数据
                        sheets.forEach(sheet => {
                            // 单个 sheet
                            sheet.list.forEach(row => {
                                // 单行
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
                        // 解析成 JSON 字符串
                        member = JSON.stringify(this.users)
                        // 存储到 localStorage
                        localStorage.setItem('users', member)
                        // 标记为有数据
                        this.isImportUsers = this.users.length
                        // 清单是否为空
                        if (this.users.length) {
                            // 清单有值
                            this.$message.success('上传清单成功')
                            location.reload(true);
                        } else {
                            // 清单为空
                            this.$message.error('上传清单是空的，请检查！')
                        }
                        // 结束加载
                        this.isLoading = false
                    } else {
                        // 结束加载
                        this.isLoading = false
                        this.$message.success('上传清单失败')
                    }
                })
            },

            // 获取单个用户数据，传入单元格字段
            userJson(item1,item2) {

                // 如果有2个字段
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
                        $('#result').css('display', 'block').html('<span>已抽完</span>');
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


