
const brandProduct = 'rgba(0,181,233,0.8)'

export const datasets = {

  recentRepChart: [
    {
      label: 'Recent Rep dataset',
      backgroundColor: brandProduct,
      borderColor: 'transparent',
      pointHoverBackgroundColor: '#fff',
      borderWidth: 0,
      data: [1, 2, 5, 0]
    }
  ],
  percentChart: [
    {
      label: 'Percent dataset',
      data: [0, 100],
      backgroundColor: [
        '#00b5e9',
        '#fa4251'
      ],
      hoverBackgroundColor: [
        '#00b5e9',
        '#fa4251'
      ],
      borderWidth: [
        0, 0
      ],
      hoverBorderColor: [
        'transparent',
        'transparent'
      ]
    }
  ],
  widgetChart1: [{
    data: [78, 81, 80, 45, 34, 12, 40],
    label: 'Dataset',
    backgroundColor: 'rgba(255,255,255,.1)',
    borderColor: 'rgba(255,255,255,.55)'
  }],
  widgetChart2: [{
    data: [1, 18, 9, 17, 34, 22],
    label: 'Dataset',
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,.55)'
  }],
  widgetChart3: [{
    data: [65, 59, 84, 84, 51, 55],
    label: 'Dataset',
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,.55)'
  }],
  widgetChart4: [{
    label: 'Dataset',
    data: [78, 81, 80, 65, 58, 75, 60, 75, 65, 60, 60, 75],
    borderColor: 'transparent',
    borderWidth: '0',
    backgroundColor: 'rgba(255,255,255,.3)'
  }]

}
