//index.js
//获取应用实例
const app = getApp()
const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({
  data: {
    nowTemp: "",
    nowWeather: "",
    nowWeatherBackground: "",
    hourlyWeather:[]
  },
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'EAXBZ-33R3X-AA64F-7FIPQ-BY27J-5UF5B' // 必填
    });
    this.getNow()
  },
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: '上海市'
      },
      success: res => {
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },
  setNow(result) {
    let temp = result.now.temp
    let weather = result.now.weather
    this.setData({
      nowTemp: temp + "°",
      nowWeather: weatherMap[weather],
      nowWeatherBackground: "/images/" + weather + "-bg.png",
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  setHourlyWeather(result) {
    // set forecast
    let nowHour = new Date().getHours();
    let forecast = result.forecast;
    let hourlyWeather = [];
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      });
    }
    this.setData({
      forecast: hourlyWeather
    })
    hourlyWeather[0].time = '现在';
  },
  setToday(result) {
    let date = new Date();
    this.setData({
      todayTemp: result.today.minTemp + "° - " + result.today.maxTemp + "°",
      todayDate: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather() {
    wx.showToast();//点击事件
    wx.navigateTo({
      url: '/pages/list/list',
    })
  },
  onTapLocation() {
    wx.getLocation({
      success: res => {
        this.getCityLocation(res);
      },
    })
  },
  getCityLocation(lres) {
    this.qqmapsdk.reverseGeocoder({
      location: {
        latitude: lres.latitude,
        longitude: lres.logitude
      },
      success: function (res) {
        console.log(res)
        let city = res.result.address_component.city
        this.setData({
          city: city,
        })
      }
    });
  },
})
