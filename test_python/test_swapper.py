import pytest
import subprocess
import time
import os
import json
import numpy as np
import datetime
from enum import Enum
from web3 import Web3, HTTPProvider, IPCProvider
#from web3.middleware import geth_poa_middleware

STEP_MINIMUM = 0

STEP_MINT = 0
STEP_ENTER = 1
STEP_EXIT = 2
STEP_CHILD_DUMMY_TRANSACTION = 3
STEP_ROOT_TRANSFER = 4
STEP_CHILD_TRANSFER = 5

STEP_INCREASE_TIME = 0
STEP_SWAP = 1

STEP_MAXIMUM = 5

class VestingTokenTracker:
    def __init__(self, holders):
        self.total_ton = {}
        for account in holders:
            self.total_ton[account["address"]] = 0
    def init(self, tokens, holders):
        self.rate = {}
        self.balance = {}
        self.start = {}
        self.cliff_duration = {}
        self.duration = {}
        for token in tokens:
            self.balance[token.address] = {}
            for account in holders:
                self.balance[token.address][account["address"]] = 0
            self.start[token.address] = token.start
            self.cliff_duration[token.address] = token.cliff_duration
            self.duration[token.address] = token.duration
    def swap(self, w3, token, holder):
        current_time = get_block_time(w3)
        if current_time < self.start[token.address]:
            return ValueError("VestingToken: no tokens are due")
        return None
    def update_rate(self, token, rate):
        self.rate[token.address] = rate
    def add_ton_amount(self, holder_address, amount):
        self.total_ton[holder_address] += amount


ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
ENDPOINT = "http://127.0.0.1:8545"

GAS_LIMIT = 5000000
GAS_PRICE = 20000000000
ACCOUNTS_PATH = "config/accounts.json"
COMPILED_VESTING_TOKEN_PATH = "contracts/VestingToken.json"
COMPILED_TON_PATH = "contracts/TON.json"
COMPILED_SWAPPER_PATH = "contracts/Swapper.json"
#VESTING_TOKEN_TOTAL_SUPLY = 10000000000000000
VESTING_TOKEN_TOTAL_SUPLY = 10000000000
VESTING_TOKEN_COUNT = 8
#VESTING_DURATION = 60*60*24
VESTING_DURATION_IN_MONTHS = 12
VESTING_DURATION = VESTING_DURATION_IN_MONTHS * 60 * 60 * 24 * 30
DAY_IN_SECONDS = 60 * 60 * 24

#@pytest.fixture(scope="session")
def ww3():
    #w3 = Web3(IPCProvider(ipc_path))
    w3 = Web3(HTTPProvider(ENDPOINT))
    #w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    return w3
    
w3 = ww3()    

def get_accounts():
    with open(ACCOUNTS_PATH, "r") as f:
        data = json.load(f)
        return data
    return None
accounts = get_accounts()
owner = accounts["owner"]

def get_holders():
    return [accounts[x] for x in filter(lambda k: k.find("holder") != -1, accounts)]
holders = get_holders()

def compile_source_file(file_path):
    with open(file_path, "r") as f:
        return json.load(f)
        
    return None

def send_raw_transaction(w3, unsigned_tx, account):
    unsigned_tx.update({"gas" : GAS_LIMIT})
    unsigned_tx.update({"gasPrice" : GAS_PRICE})
    unsigned_tx.update({"nonce" : w3.eth.getTransactionCount(account["address"])})
    signed_tx = w3.eth.account.sign_transaction(unsigned_tx, account["privateKey"])
    
    tx_hash = w3.eth.sendRawTransaction(signed_tx.rawTransaction)
    tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    assert tx_receipt["status"] == 1
    return tx_hash, tx_receipt

def deploy_contract(w3, json_path, *args):
    contract_interface = compile_source_file(json_path)
    unsigned_tx = w3.eth.contract(
        abi=contract_interface["abi"],
        bytecode=contract_interface["bytecode"]).constructor(*args).buildTransaction()
    tx_hash, tx_receipt = send_raw_transaction(w3, unsigned_tx, owner)

    return tx_receipt["contractAddress"]


class VestingToken:
    def __init__(self, w3):
        data = compile_source_file(COMPILED_VESTING_TOKEN_PATH)
        self.w3 = w3
        self.address = deploy_contract(w3, COMPILED_VESTING_TOKEN_PATH, ZERO_ADDRESS, ZERO_ADDRESS, 0, 'Strategic Tokamak Network Token', 18, 'StrategicTON', True)
        self.instance = w3.eth.contract(address=self.address, abi=data["abi"])
        unsigned_tx = self.instance.functions.generateTokens(owner["address"], VESTING_TOKEN_TOTAL_SUPLY).buildTransaction({"from": owner["address"]})
        tx_hash, tx_receipt = send_raw_transaction(w3, unsigned_tx, owner)
    def transfer(self, sender, recepient, amount):
        unsigned_tx = self.instance.functions.transfer(recepient, amount).buildTransaction({"from": sender["address"]})
        tx_hash, tx_receipt = send_raw_transaction(self.w3, unsigned_tx, sender)
    def initiate(self, start, cliff_duration, duration):
        self.start = start
        self.cliff_duration = cliff_duration
        self.duration = duration
        unsigned_tx = self.instance.functions.initiate(start, cliff_duration, duration).buildTransaction({"from": owner["address"]})
        tx_hash, tx_receipt = send_raw_transaction(self.w3, unsigned_tx, owner)

class Ton:
    def __init__(self, w3):
        data = compile_source_file(COMPILED_TON_PATH)
        self.w3 = w3
        self.address = deploy_contract(w3, COMPILED_TON_PATH)
        self.instance = w3.eth.contract(address=self.address, abi=data["abi"])
        unsigned_tx = self.instance.functions.mint(owner["address"], VESTING_TOKEN_TOTAL_SUPLY * 100).buildTransaction({"from": owner["address"]})
        tx_hash, tx_receipt = send_raw_transaction(w3, unsigned_tx, owner)
    def transfer(self, sender, recepient, amount):
        unsigned_tx = self.instance.functions.transfer(recepient, amount).buildTransaction({"from": sender["address"]})
        tx_hash, tx_receipt = send_raw_transaction(self.w3, unsigned_tx, sender)
    def get_balance(self, caller):
        return self.instance.functions.balanceOf(caller).call({"from": caller})

class Swapper:
    def __init__(self, w3, ton_address):
        data = compile_source_file(COMPILED_SWAPPER_PATH)
        self.w3 = w3
        self.address = deploy_contract(w3, COMPILED_SWAPPER_PATH, ton_address)
        self.instance = w3.eth.contract(address=self.address, abi=data["abi"])
    def update_rate(self, token, rate):
        unsigned_tx = self.instance.functions.updateRate(token, rate).buildTransaction({"from": owner["address"]})
        tx_hash, tx_receipt = send_raw_transaction(self.w3, unsigned_tx, owner)
    def swap(self, token, sender):
        unsigned_tx = self.instance.functions.swap(token).buildTransaction({"from": sender["address"]})
        tx_hash, tx_receipt = send_raw_transaction(self.w3, unsigned_tx, sender)
    def relesableAmount(self, token, beneficiary, sender):
        relesableAmount = self.instance.functions.relesableAmount(token, beneficiary).call({"from": sender})
    def change_tokens_controller(self, tokens):
        for token in tokens:
            unsigned_tx = token.instance.functions.changeController(self.address).buildTransaction({"from": owner["address"]})
            tx_hash, tx_receipt = send_raw_transaction(self.w3, unsigned_tx, owner)


def time_increase_to(w3, duration):
    block = w3.eth.getBlock("latest")
    current_time = block["timestamp"]
    w3.provider.make_request("evm_increaseTime", [duration])
    w3.provider.make_request("evm_mine", None)

def time_add_one_minute(w3):
    block = w3.eth.getBlock("latest")
    current_time = block["timestamp"]
    time_increase_to(w3, 60)
    block = w3.eth.getBlock("latest")
    block_time = block["timestamp"]
    print(f"block time : {block_time}")
    assert block_time >= current_time + 60

def get_block_time(w3):
    block = w3.eth.getBlock("latest")
    return block["timestamp"]

def init(w3):
    tracker = VestingTokenTracker(holders)
    block_time = get_block_time(w3)
    vesting_tokens = []
    ton = Ton(w3)
    swapper = Swapper(w3, ton.address)
    ton.transfer(owner, swapper.address, VESTING_TOKEN_TOTAL_SUPLY * 100)
    begin_time = block_time + 600
    for i in range(VESTING_TOKEN_COUNT):
        vt = VestingToken(w3)
        vesting_tokens.append(vt)
        swapper.update_rate(vt.address, i + 1)
        for account in holders:
            amount = int(np.random.choice(int(VESTING_TOKEN_TOTAL_SUPLY / len(holders)), 1)[0])
            vt.transfer(accounts["owner"], account["address"], amount)
            tracker.add_ton_amount(account["address"], amount * (i+1))
            print(f"#### VestingToken amount - token: {vt.address}, recepient: {account['address']}, amount: {amount}, rate: {i+1}")
        cliff_duration = int(np.random.choice(VESTING_DURATION_IN_MONTHS, 1)[0])
        vt.initiate(begin_time, cliff_duration, VESTING_DURATION_IN_MONTHS)
        begin_date = datetime.datetime.fromtimestamp(int(begin_time)).strftime('%Y-%m-%d %H:%M:%S')
        print(f"#### Token init - {begin_date}, {cliff_duration}, {VESTING_DURATION_IN_MONTHS}")
    swapper.change_tokens_controller(vesting_tokens)

    tracker.init(vesting_tokens, holders)

    return vesting_tokens, ton, swapper, tracker, begin_time

def test_swap(w3):
    vesting_tokens, ton, swapper, tracker, begin_time = init(w3)
    current_time = get_block_time(w3)
    last_swap_time = {}
    for holder in holders:
        last_swap_time[holder["address"]] = 0
    while current_time < begin_time + VESTING_DURATION:
        current_date = datetime.datetime.fromtimestamp(int(current_time)).strftime('%Y-%m-%d %H:%M:%S')
        print(f"######################################## current time : {current_date}")
        time_to_increase = int(np.random.choice(range(DAY_IN_SECONDS), 1)[0])
        time_increase_to(w3, time_to_increase)
        caller = np.random.choice(holders, 1)[0]
        token = np.random.choice(vesting_tokens, 1)[0]
        expected = tracker.swap(w3, token, caller)
        try:
            #print(f"#### Swap - timestamp: {current_time}, caller: {caller['address']}, token: {token.address}")
            swapper.swap(token.address, caller)
            ton_balance = ton.get_balance(caller['address'])
            print(f"after swap {token.address}, balance of {caller['address']} is {ton_balance}")
        except Exception as e:
            #print(e)
            pass
        current_time = get_block_time(w3)

    for account in holders:
        for token in vesting_tokens:
            try:
                #print(f"#### Swap - caller: {account['address']}, token: {token.address}")
                swapper.swap(token.address, account)
            except Exception as e:
                pass
        expected = tracker.total_ton[account["address"]]
        ton_balance = ton.get_balance(account["address"])
        print(f"result expected:ton_balance = {expected}:{ton_balance}")
        assert expected == ton_balance
    
test_swap(w3)