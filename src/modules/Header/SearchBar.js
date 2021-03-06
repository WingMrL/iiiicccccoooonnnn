import React from 'react';
import { Select, Icon } from 'antd';
import axios from 'axios';
// import jsonp from 'fetch-jsonp';
// import querystring from 'querystring';

const Option = Select.Option;

import styles from './SearchBar.less';
import { Link } from 'react-router-dom';
import config from '../../../config/config';
import { Scrollbars } from 'react-custom-scrollbars';

/**
 * @description 搜索组件
 * 
 * @class SearchBar
 * @extends {React.Component}
 */
class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.timeout;
        this.currentValue;
        this.onSelect = false; // 是否是选择导致搜索框发生变化，是的话，不触发fetch搜索建议
        this.state = {
            data: [],
            value: '',
        }
    }

    /**
     * @description fetch搜索建议
     * @memberof SearchBar
     */
    fetch = (value, callback) => {
        let self = this;
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.currentValue = value;

        function fake() {
            let data = {
                searchName: value
            };
            axios.post(`${config.serverHost}/api/suggest`, data)
                    .then((res) => {
                        if(res.data.code == 0) {
                            let data = res.data.data;
                            callback(data);
                        } else if(res.data.code == -1) {
                            self.setState({
                                data: self.getSearchHistory()
                            });
                        }
                        // console.log(res);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
        }

        this.timeout = setTimeout(fake, 500);
    }

    /**
     * @description 当输入框focus的时候，显示搜索结果
     * @memberof SearchBar
     */
    handleSelectOnFocus = () => {
        if(this.state.value == '') {
            this.setState({
                data: this.getSearchHistory()
            });
        }
    }

    
    /**
     * @description 获取搜索结果
     * @memberof SearchBar
     */
    getSearchHistory = () => {
        let history = localStorage.getItem('searchHistory');
        if(history) {
            history = JSON.parse(history);
        } else {
            history = [];
        }
        return history;
    }

    /**
     * @description 搜索input的keyUp事件
     * @memberof SearchBar
     */
    handleSearchInputOnKeyUp = (e) => {
        if(e.key == 'Enter') {
            let { value } = this.state;
            this.saveSearchHistory(value);
            console.log(value);
            if(this.props.onSearch) {
                this.props.onSearch(value);
            } 
            let { history } = this.props;
            history.push(`/searchresult?search=${value}`);
            
        }
    }


    handleOnSelect = () => {
        this.onSelect = true;
    }

    handleSearchOnClick = (e) => {
        
        // 保存搜索纪录
        let { value } = this.state;
        this.saveSearchHistory(value);

        // 在搜索页进行搜索的时候触发
        if(this.props.onSearch) {
            this.props.onSearch(value);
        }
    }

    /**
     * @description 保存搜索纪录
     * @param {String} value - 搜索词
     * @memberof SearchBar
     */
    saveSearchHistory = (value) => {
        let history = this.getSearchHistory();
        let index = -1;
        history.forEach((v, i) => {
            if(v.text == value) {
                index = i;
            }
        });
        if(index == -1 || history.length == 0) {
            value = {
                _id: `id_${Date.now().toString()}`, // 这个id会作为react的key，所以要加上时间戳唯一化
                text: value
            }
        } else {
            value = history.splice(index, 1)[0];
        }
        history.unshift(value);
        history = JSON.stringify(history);
        localStorage.setItem('searchHistory', history);
    }

    handleChange = (value) => {
        this.setState({ value });
        if(this.onSelect) {
            this.onSelect = false;
            return;
        }
        this.fetch(value, data => this.setState({ data }));
    }

    render() {
        const options = this.state.data.map((d) => {
                return <Option key={d._id} value={d.text}>{d.text}</Option>
            });
        const { value } = this.state;
        return (
            <div 
                style={{display: "flex", position: "relative",}}
                onKeyUp={this.handleSearchInputOnKeyUp}
                >
                <Select
                    mode="combobox"
                    value={value}
                    placeholder={"输入图标的名称或标签"}
                    notFoundContent=""
                    onFocus={this.handleSelectOnFocus}
                    style={{
                        width: 420,
                        height: 48,
                        marginLeft: 45,
                        borderRadius: 100,
                    }}
                    defaultActiveFirstOption={false}
                    showArrow={false}
                    filterOption={false}
                    onChange={this.handleChange}
                    dropdownClassName={`custom-search-dropdown`}
                    dropdownStyle={{
                        maxHeight: 224
                    }}
                    onSelect={this.handleOnSelect}
                    
                    >
                    {options}
                </Select>
                <Link 
                    to={{
                        pathname: '/searchresult',
                        search: `?search=${value}`
                    }} 
                    className={"custom-search-bar-search-link"}
                    onClick={this.handleSearchOnClick}
                    disabled={value == ''}
                    >
                    <Icon type="search" className={"custom-search-bar-search-icon"}/>
                </Link>
            </div>
        );
    }
}

export default SearchBar;